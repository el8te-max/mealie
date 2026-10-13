# Mealie: Core Logic

How Mealie (v3.28.0) works underneath the UI, written as a reference for rebuilding the app from scratch for one household. Everything here was read from the backend source in `mealie/` (about 35,700 lines of Python, 241 API endpoints).

---

## 1. The big picture

Mealie is a single FastAPI server with a SQL database (SQLite or Postgres). The code has four layers:

| Layer | Folder | Job |
|---|---|---|
| Routes | `mealie/routes/` | HTTP endpoints. Thin. Check permissions, call a service or repository. |
| Services | `mealie/services/` | Business logic: scraping, parsing, shopping-list merging, meal-plan randomizing, events. |
| Repositories | `mealie/repos/` | Database access. Every query is automatically scoped to the current group and household. |
| Models / Schemas | `mealie/db/models/`, `mealie/schema/` | Database tables (SQLAlchemy) and API shapes (Pydantic). |

Background work (webhooks, cleanup, timeline entries) runs on an in-process scheduler with daily and hourly jobs. There is no separate worker or queue.

---

## 2. Who owns what: tenancy and users

```
Server
└── Group            (shares: recipes, foods, units, labels, tags, categories, tools)
    └── Household    (owns: meal plans, shopping lists, cookbooks, webhooks, notifiers, "on hand" foods)
        └── User
```

- **Group** is the top-level space. Recipes and the food/unit/label vocabulary belong to the group, so every household in it sees the same recipe library.
- **Household** is a family unit inside a group. Meal plans, shopping lists, cookbooks, webhooks and notifications belong to a household.
- **User** belongs to exactly one group and one household.
- Repositories filter by `group_id` and `household_id` automatically, so a request can never read another group's data.

**Permissions** are flags on the user:

| Flag | Allows |
|---|---|
| `admin` | Everything, server-wide: users, groups, backups, site settings |
| `can_manage` | Group data: foods, units, labels, migrations, data management |
| `can_manage_household` | Household settings |
| `can_organize` | Create and edit tags, categories, tools |
| `can_invite` | Create invite links |

**Auth**: email/password with a JWT, long-lived API tokens per user, and optional LDAP and OIDC. Failed logins increment a counter and lock the account. A scheduled job unlocks it later.

**Simplification for one family:** you need one group, one household, a handful of users, and probably just `admin` vs. normal user. Most of the tenancy machinery can go.

---

## 3. The recipe

A recipe is the central object. Its main parts:

- **Identity:** `id`, `slug` (URL name, unique per group), `name`, `description`, `image`
- **Ownership:** `user_id`, `household_id`, `group_id`
- **Timing and yield:** `prep_time`, `cook_time`, `perform_time`, `total_time` (free text like "1 hour"), `recipe_servings` (number), `recipe_yield_quantity` + `recipe_yield` (e.g. "2 loaves")
- **Organizers:** `recipe_category[]`, `tags[]`, `tools[]`
- **Content:** `recipe_ingredient[]`, `recipe_instructions[]`, `notes[]`, `nutrition`, `assets[]` (attached files)
- **Source:** `org_url` (where it was imported from)
- **Social:** `rating`, `comments[]`, per-user favorites and ratings, `timeline_events[]`, `share_tokens[]`
- **Settings:** `public`, `show_nutrition`, `show_assets`, `landscape_view`, `disable_comments`, `locked`
- **Extras:** a free key/value dictionary for integrations
- **Search helpers:** `name_normalized`, `description_normalized` (lower-cased, accents stripped), maintained automatically on save

### Ingredients: the clever part

Each ingredient line is structured, not just text:

```
RecipeIngredient
  quantity          2.5
  unit       ──►    IngredientUnit   ("cup", plural "cups", abbreviation "c", standard_unit "cup", fraction display on/off)
  food       ──►    IngredientFood   ("flour", plural, label "Baking", aliases ["all-purpose flour"], substitutions)
  note              "sifted"
  title             optional section header, e.g. "For the sauce"
  original_text     what the user or the website originally wrote
  referenced_recipe optional: this line is another recipe (sub-recipe)
  reference_id      stable id so instruction steps can point at it
  display           computed display string
```

- **Units** and **foods** are shared, group-wide vocabularies with plural forms, aliases and normalized names. They are what make shopping-list merging and scaling possible.
- A unit can declare a **standard unit** (for example cup, tablespoon, gram). Two different units with standard units in the same family can be converted and combined.
- A food has an optional **label** (a shopping aisle like "Produce"), and households can mark a food as **on hand** (always in stock).
- **Sub-recipes**: an ingredient can reference another recipe. Adding the parent to a shopping list pulls in the child's ingredients recursively.
- A recipe-level setting `disable_amount` exists for recipes left as plain text lines.

### Instructions

`RecipeStep`: `title` (optional section header), `text` (Markdown), `summary`, plus **ingredient references** (this step uses these ingredient lines, by `reference_id`) and note references. This is what lets a cook mode show "ingredients for this step".

### Timeline and "last made"

- Every recipe has a **timeline** of events, each with a subject, type, message, optional image and timestamp. Users add "I made this" entries, and the system adds entries too.
- A **daily job** looks at each household's meal plan for today and writes a "Jane made this for dinner" timeline event for each planned recipe.
- Each household also tracks **last_made** per recipe (in a household-to-recipe link table), updated from those events.

### Sharing

A **share token** gives a public, expiring link to one recipe. A daily job deletes expired tokens. A recipe can also simply be marked `public`, which matters if the group allows public browsing.

---

## 4. Getting recipes in

### 4a. Import from a URL

`create_from_url(url)` tries a list of **strategies in order** and stops at the first that works:

1. **`recipe-scrapers` package**: the open-source Python library that understands hundreds of recipe sites plus generic schema.org JSON-LD markup. Mealie then cleans the result (times, yields, instructions, notes). For instructions, it only uses the site's structured step data when that data is strictly better than the flattened text.
2. **AI transcription**: for video pages. It transcribes the audio with OpenAI, then turns the transcript into a recipe.
3. **AI from the page**: hands the page text and images to an LLM through the import workflow (see 4b).
4. **OpenGraph fallback**: grabs at least a title, description and image from the page's meta tags so you get a stub recipe.

Then `finalize_scraped_recipe` assigns an id, downloads the image, and guarantees a name and slug. Optional flags decide whether scraped tags and categories are kept.

### 4b. The AI import workflow

Used by "Import with AI" and by strategy 3 above. A pipeline of four steps over a shared context:

1. **Compile source**: turn whatever was supplied (web page, raw HTML or JSON, structured data, photos, a transcript) into prompt material. Each source type has its own compiler.
2. **Build recipe**: the LLM returns a structured recipe.
3. **Translate recipe**: optionally translate it into the user's language.
4. **Resolve organizers**: map suggested tags and categories onto existing ones, or create them.

The workflow never saves. It returns a draft that the caller saves. Photo import ("from image") is just this workflow with images as the source.

### 4c. Other ways in

- **Manual create** with an empty recipe.
- **Raw HTML or JSON** pasted in, which skips the network fetch.
- **Bulk URL import**: a background task scrapes many URLs and records a report of successes and failures.
- **ZIP import** of a Mealie recipe export.
- **Migrations** from other apps: Chowdown, Cook'n, CopyMeThat, MyRecipeBox, Nextcloud Cookbook, Paprika, Plan to Eat, Recipe Keeper, Tandoor, and old Mealie. Each is a converter from that app's export format into Mealie recipes.

---

## 5. Ingredient parsing

Free-text lines like "2 ½ cups all-purpose flour, sifted" become structured `quantity / unit / food / note`. There are three parsers behind one interface (`parse(list[str]) -> list[ParsedIngredient]`):

| Parser | How | Notes |
|---|---|---|
| **NLP** (default) | The `ingredient-parser-nlp` Python library, a trained statistical model | Handles fractions, ranges, composite amounts ("1 cup plus 2 tbsp"). Returns confidence scores. |
| **Brute force** | Hand-written rules and regex | Fast, offline, less accurate |
| **OpenAI** | Asks the LLM to structure the lines | Best on messy input, needs an API key |

After parsing, the unit and food text is **matched** against the group's existing units and foods. Matching tries the normalized name, plural, abbreviation and aliases, then falls back to the closest **fuzzy match** above a threshold. Unmatched values are offered as new units or foods for the user to confirm.

---

## 6. Search and filtering

### Search box

- The search text is normalized (lower-case, optionally accents stripped) and split into tokens. Quoted phrases stay together.
- On **Postgres**, a fuzzy trigram similarity search runs alongside the tokenized search. On **SQLite** (or when the query contains quotes), only tokenized `LIKE` matching on the normalized name and description is used.

### Query filter language

A small filter language used by cookbooks, meal-plan rules, the recipe finder and many internal jobs:

```
tags.name CONTAINS ALL ["vegetarian", "quick"] AND recipeCategory.name IN ["dinner"] AND lastMade < "$NOW-30d"
```

- Operators: `=  <>  >  <  >=  <=`, `IS`, `IS NOT`, `IN`, `NOT IN`, `CONTAINS ALL`, `LIKE`, `NOT LIKE`, joined with `AND` / `OR` and parentheses.
- `$NOW` with an offset gives relative dates.
- It works on any column of the model, plus relationships (tags, categories, tools, foods, households).
- `combine_filters()` ANDs several filters together and validates each.
- Lists support `order_by=random` with a seed, so the same random page can be fetched repeatedly.

**Cookbooks** are just a saved query filter plus a name, slug, position and public flag. A cookbook's recipes are whatever currently matches the filter, not a hand-picked list.

---

## 7. Meal planning

- A **plan entry** has a `date`, an `entry_type` (breakfast, lunch, dinner, side, snack, drink, dessert), and either a `recipe_id` or a free-text `title` + `text` note.
- **Rules** drive the "random meal" button. Each rule has a `day` (Monday to Sunday, or unset meaning any day), an `entry_type` (or unset meaning any type), and a `query_filter_string` (for example "tag is vegetarian").
- **Picking a random recipe for a date and type:**
  1. Load every rule whose day matches (that weekday or unset) **and** whose type matches (that type or unset), for this household.
  2. **AND** all their filters together.
  3. Fetch recipes matching that combined filter, ordered randomly, and take the first.
  4. With no rules, any recipe qualifies. Recipes from every household in the group are eligible unless a rule restricts households.
  5. If nothing matches, return a "no recipes match your rules" error.
- Plan entries feed the daily "made this" timeline job (section 3).
- Plan settings in the UI cover how many days to show, and so on.

---

## 8. Shopping lists: the most intricate logic

A household can have many lists. Each list has items, recipe references, and per-list label ordering (aisle order).

**Item:**

```
ShoppingListItem
  quantity, unit, food, note, label, checked, position, extras
  recipe_references[]   which recipes contributed to this item, and at what scale
```

**Adding a recipe to a list** (`add_recipe_ingredients_to_list`, with a scale such as 2× servings):

1. Turn each ingredient into a candidate item: quantity × scale, plus unit, food, note and label (from the food's label, or matched by name). Sub-recipe ingredients are expanded recursively.
2. Skip foods the household has marked **on hand**.
3. Lines from the same recipe that refer to the same thing are combined first, summing quantities and joining notes.
4. Each candidate is then **merged** into an existing unchecked item when `can_merge` allows, otherwise created as a new item.
5. The list keeps a list-level recipe reference with a count, so the UI can show "contains Lasagna ×2".

**`can_merge(a, b)`**, all of these must hold:

- Neither item is checked.
- Same food (or both have no food).
- Units are identical, or both have a standard unit and the converter can convert between them (for example tbsp to cup).
- If there is no food, the notes must match exactly. That is how plain-text items merge.

**`merge_items(from, to)`:**

- If both units are convertible, convert and sum, keeping a sensible unit. Otherwise just add the quantities.
- Notes are combined as a set joined with " | ".
- Extras dictionaries are merged.
- Recipe references are merged per recipe, **summing their scales** (a missing scale counts as 1).

**Removing a recipe from a list** reverses this. For each item, subtract that recipe's share of the quantity (partially, if the scale was larger). Decrement or remove the reference. Delete the item only if its quantity reaches 0 **and** it has no recipe references left. Then decrement the list-level recipe count.

**Bulk create and update** apply the same merge logic against existing items, so editing an item to match another one merges them.

**Housekeeping:** a daily job keeps at most **100 checked items** per list and deletes older checked ones. New lists copy the group's labels in name order as the default aisle order.

---

## 9. Organizers and vocabulary

| Thing | Scope | Purpose |
|---|---|---|
| Categories | group | Broad classification ("Dinner", "Dessert") |
| Tags | group | Free-form ("quick", "vegetarian") |
| Tools | group | Equipment ("Instant Pot"). Households can mark tools as owned (on hand). |
| Foods | group | Ingredient vocabulary with aliases, plurals, label, substitutions, on-hand per household |
| Units | group | Unit vocabulary with aliases, abbreviations, fraction display, standard unit for conversion |
| Labels | group | Shopping aisles with colours. Applied to foods and list items. |

Seeders ship default foods, units and labels per language, and the admin can load them.

---

## 10. Events, notifications and integrations

- An **event bus** publishes typed events: recipe created/updated/deleted, user signup, migrations, export/import, meal-plan entry created/updated/deleted, shopping list created/updated/deleted, cookbook and tag created/updated/deleted, and test messages.
- **Listeners:**
  - **Apprise notifier**: a household configures Apprise URLs (Discord, Telegram, email, Gotify and many more) and ticks which event types to send.
  - **Webhooks**: a household defines webhooks that fire **at a scheduled time each day**, posting that day's meal plan as JSON (meant for Home Assistant and similar).
- **Recipe actions**: household-defined buttons on a recipe that open a URL (link) or POST the recipe JSON (post) to an external service, for example "send to Todoist".

---

## 11. Background jobs

| Cadence | Job |
|---|---|
| Daily | Create "made this" timeline events from today's meal plan; trim checked shopping-list items to 100 per list; purge expired share tokens, password resets, registrations and old group exports |
| Every minute | Check each webhook's scheduled time and post the day's meal plan when it is due |
| Hourly | Unlock locked users |

All jobs run in-process via a small scheduler registry.

---

## 12. Admin and maintenance

- **Backups:** full database plus files exported to a ZIP, and restore from a ZIP.
- **Exports:** per-group data exports, purged after a while.
- **Maintenance:** clean temporary files, images and logs, and show storage stats.
- **Site settings / about:** version check, configuration health (base URL, email, LDAP, OIDC status).
- **AI provider settings** per group: which provider to use for text and for images.
- **Email:** SMTP for password reset and invites.
- **Debug tools:** test the OpenAI connection and the ingredient parser.

---

## 13. What a family-only rebuild actually needs

| Keep: the core value | Reuse instead of rebuilding | Drop or postpone |
|---|---|---|
| Recipe model with structured ingredients, step-to-ingredient links, notes, images | `recipe-scrapers` for URL import | Groups and multi-household tenancy (one household) |
| Foods, units (with standard-unit conversion), labels | `ingredient-parser-nlp` for parsing | LDAP, OIDC, fine-grained permission flags |
| Shopping list merge, scale and remove logic (section 8) | An LLM API for AI import and photos | Most migrations (keep only the app you actually come from) |
| Meal plan with day/type rules and random pick | SQLite full-text search | Public share tokens, comments, ratings by multiple groups |
| Simple query filters for cookbooks and rules | Apprise for notifications | Server tasks UI, analytics, admin dashboards |
| Timeline / "last made" | | Webhook scheduler (unless you use Home Assistant) |
| Backups (copy the SQLite file plus the images folder) | | |

The two pieces of logic genuinely worth studying before writing any code are **shopping-list merging** (section 8) and **unit conversion and matching** (sections 3 and 5). Almost everything else is standard CRUD.

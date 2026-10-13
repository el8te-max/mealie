import type { NavAction } from "~/composables/use-app-nav";
import { useToggleDarkMode } from "~/composables/use-utils";

/**
 * Handles navigation items that are actions rather than links. Dialog state is shared through
 * `useState` so the layout renders each dialog once while the sidebar and More page open it.
 */
export function useNavActions() {
  const auth = useMealieAuth();
  const toggleDark = useToggleDarkMode();
  const languageDialog = useState("pro-language-dialog", () => false);
  const announcementsDialog = useState("pro-announcements-dialog", () => false);
  const searchRequests = useState("pro-search-requests", () => 0);

  async function handleNavAction(action: NavAction) {
    switch (action) {
      case "logout":
        try {
          await auth.signOut("/login?direct=1");
        }
        catch (e) {
          console.error(e);
        }
        break;
      case "login":
        await navigateTo("/login");
        break;
      case "toggle-dark":
        toggleDark();
        break;
      case "language":
        languageDialog.value = true;
        break;
      case "announcements":
        announcementsDialog.value = true;
        break;
      case "search":
        // DefaultLayout owns the search dialog and opens it whenever this counter changes.
        searchRequests.value++;
        break;
    }
  }

  return { handleNavAction, languageDialog, announcementsDialog, searchRequests };
}

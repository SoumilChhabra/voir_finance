import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { add, list, card, pricetags } from "ionicons/icons";
import { StoreProvider } from "./data/store";
import AuthGate from "./auth/AuthGate";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { App as CapApp } from "@capacitor/app";
import { supabase } from "./lib/supabase";
import AuthCallback from "./auth/AuthCallback";

import All from "./pages/All";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import AddAccount from "./pages/AddAccount";
import AddTransaction from "./pages/AddTransaction";
import AccountDetail from "./pages/AccountDetail";
import CategoryDetail from "./pages/CategoryDetail";
import AddCategory from "./pages/AddCategory";
import EditTransaction from "./pages/EditTransaction";
import Background from "./components/Background";
import Hero from "./components/Hero";

import "@ionic/react/css/core.css";
import "./theme/variables.css";
import "./theme/global.css"; // <-- make sure this is imported

setupIonicReact();

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const map: Record<string, string> = {
      "/all": "All",
      "/accounts": "Accounts",
      "/categories": "Categories",
      "/account/": "Account",
      "/category/": "Category",
      "/add": "Add",
      "/edit/": "Edit",
    };
    let label = "Voir";
    for (const [prefix, name] of Object.entries(map)) {
      if (location.pathname.includes(prefix)) {
        label = `Voir — ${name}`;
        break;
      }
    }
    document.title = label;
  }, [location.pathname]);
  return null;
}

export default function App() {
  useEffect(() => {
    document.body.classList.add("dark");
  }, []);

  useEffect(() => {
    let sub: any;

    (async () => {
      sub = await CapApp.addListener("appUrlOpen", async ({ url }) => {
        // Only handle our auth callback
        const prefix = "com.soumilchhabra.penny://auth/callback";
        if (!url.startsWith(prefix)) return;

        try {
          // Parse both hash and query for maximum compatibility
          const u = new URL(url);
          const hash = u.hash?.replace(/^#/, "") ?? "";
          const hashParams = new URLSearchParams(hash);
          const queryParams = u.search
            ? new URLSearchParams(u.search)
            : new URLSearchParams();

          // If Supabase returned an error (e.g., tapped twice / expired)
          const error = hashParams.get("error") || queryParams.get("error");
          if (error) {
            console.error(
              "Auth error:",
              error,
              hashParams.get("error_description") ||
                queryParams.get("error_description")
            );
            return;
          }

          // Magic-link (email OTP) path: tokens are in the hash
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            // at this point your AuthGate should show the app
            return;
          }

          // Fallback: code-exchange path (some providers return ?code=)
          const code = hashParams.get("code") || queryParams.get("code");
          const anyAuth: any = supabase.auth;
          if (code && typeof anyAuth.exchangeCodeForSession === "function") {
            // redirectTo is optional but nice to be explicit
            await anyAuth.exchangeCodeForSession({ code, redirectTo: prefix });
          }
        } catch (e) {
          console.error("Auth callback handling failed:", e);
        }
      });
    })();

    return () => {
      sub?.remove();
    };
  }, []);

  return (
    <IonApp>
      <Background />
      <Hero />
      <AuthGate>
        <StoreProvider>
          <IonReactRouter>
            <TitleUpdater />
            <IonTabs>
              <IonRouterOutlet>
                <Route path="/tabs/all" component={All} exact />
                <Route path="/tabs/accounts" component={Accounts} exact />
                <Route path="/tabs/categories" component={Categories} exact />
                <Route
                  path="/add"
                  render={() => <AddTransaction asPage />}
                  exact
                />
                <Route
                  path="/edit/:id"
                  render={() => <EditTransaction asPage />}
                  exact
                />

                <Route exact path="/">
                  <Redirect to="/tabs/all" />
                </Route>
                <Route path="/add-account" component={AddAccount} exact />
                <Route path="/add-category" component={AddCategory} exact />
                <Route path="/account/:id" component={AccountDetail} exact />
                <Route path="/category/:id" component={CategoryDetail} exact />
                <Route path="/auth/callback" component={AuthCallback} exact />
              </IonRouterOutlet>

              <IonTabBar slot="bottom">
                <IonTabButton tab="all" href="/tabs/all">
                  <IonIcon icon={list} />
                  <IonLabel>All</IonLabel>
                </IonTabButton>
                <IonTabButton tab="accounts" href="/tabs/accounts">
                  <IonIcon icon={card} />
                  <IonLabel>Accounts</IonLabel>
                </IonTabButton>
                <IonTabButton tab="categories" href="/tabs/categories">
                  <IonIcon icon={pricetags} />
                  <IonLabel>Categories</IonLabel>
                </IonTabButton>
              </IonTabBar>

              {/* Floating + button visible on tab pages */}
              <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton routerLink="/add">
                  <IonIcon icon={add} />
                </IonFabButton>
              </IonFab>
            </IonTabs>
          </IonReactRouter>
        </StoreProvider>
      </AuthGate>
    </IonApp>
  );
}

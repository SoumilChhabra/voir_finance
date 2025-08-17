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
import {
  add,
  list,
  card,
  pricetags,
  personCircleOutline,
} from "ionicons/icons";
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
import Profile from "./pages/Profile";
import Budget from "./pages/Budget";
import { wallet } from "ionicons/icons";

import "@ionic/react/css/core.css";
import "./theme/variables.css";
import "./theme/global.css";

setupIonicReact();

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const map: Record<string, string> = {
      "/tabs/all": "All",
      "/tabs/accounts": "Accounts",
      "/tabs/categories": "Categories",
      "/tabs/profile": "Profile",
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
        const prefix = "com.soumilchhabra.penny://auth/callback";
        if (!url.startsWith(prefix)) return;

        try {
          const u = new URL(url);
          const hash = u.hash?.replace(/^#/, "") ?? "";
          const hashParams = new URLSearchParams(hash);
          const queryParams = u.search
            ? new URLSearchParams(u.search)
            : new URLSearchParams();

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

          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            return;
          }

          const code = hashParams.get("code") || queryParams.get("code");
          const anyAuth: any = supabase.auth;
          if (code && typeof anyAuth.exchangeCodeForSession === "function") {
            await anyAuth.exchangeCodeForSession({ code, redirectTo: prefix });
          }
        } catch (e) {
          console.error("Auth callback handling failed:", e);
        }
      });
    })();
    return () => sub?.remove();
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
                {/* Tab roots (RRv5: component/exact) */}
                <Route path="/tabs/all" component={All} exact />
                <Route path="/tabs/accounts" component={Accounts} exact />
                <Route path="/tabs/categories" component={Categories} exact />
                <Route path="/tabs/profile" component={Profile} exact />

                {/* Modal/secondary pages */}
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
                <Route path="/add-account" component={AddAccount} exact />
                <Route path="/add-category" component={AddCategory} exact />
                <Route path="/account/:id" component={AccountDetail} exact />
                <Route path="/category/:id" component={CategoryDetail} exact />
                <Route path="/auth/callback" component={AuthCallback} exact />
                <Route path="/tabs/budget" component={Budget} exact />

                {/* Default redirect */}
                <Route exact path="/">
                  <Redirect to="/tabs/all" />
                </Route>
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

                <IonTabButton tab="budget" href="/tabs/budget">
                  <IonIcon icon={wallet} />
                  <IonLabel>Budget</IonLabel>
                </IonTabButton>

                <IonTabButton tab="profile" href="/tabs/profile">
                  <IonIcon icon={personCircleOutline} />
                  <IonLabel>Profile</IonLabel>
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

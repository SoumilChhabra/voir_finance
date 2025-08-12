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
                <Route path="/add" component={AddTransaction} exact />
                <Route exact path="/">
                  <Redirect to="/tabs/all" />
                </Route>
                <Route path="/add-account" component={AddAccount} exact />
                <Route path="/add-category" component={AddCategory} exact />
                <Route path="/account/:id" component={AccountDetail} exact />
                <Route path="/category/:id" component={CategoryDetail} exact />
                <Route path="/edit/:id" component={EditTransaction} exact />
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

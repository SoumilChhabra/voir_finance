import React from "react";
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
} from "@ionic/react";
import {
  card,
  pricetags,
  personCircleOutline,
  settings,
  add,
} from "ionicons/icons";
import Shell from "../components/Shell";

const Manage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <Shell title="Manage" className="compact-header">
          <IonList inset>
            <IonItem button routerLink="/tabs/accounts" className="manage-item">
              <IonIcon icon={card} slot="start" color="primary" />
              <IonLabel>
                <h3>Accounts</h3>
                <p>Manage your bank accounts and cards</p>
              </IonLabel>
              <IonIcon icon={add} slot="end" color="primary" />
            </IonItem>

            <IonItem
              button
              routerLink="/tabs/categories"
              className="manage-item"
            >
              <IonIcon icon={pricetags} slot="start" color="secondary" />
              <IonLabel>
                <h3>Categories</h3>
                <p>Organize transactions by category</p>
              </IonLabel>
              <IonIcon icon={add} slot="end" color="secondary" />
            </IonItem>

            <IonItem button routerLink="/tabs/profile" className="manage-item">
              <IonIcon
                icon={personCircleOutline}
                slot="start"
                color="tertiary"
              />
              <IonLabel>
                <h3>Profile</h3>
                <p>Manage your account settings</p>
              </IonLabel>
              <IonIcon icon={settings} slot="end" color="medium" />
            </IonItem>
          </IonList>
        </Shell>
      </IonContent>
    </IonPage>
  );
};

export default Manage;

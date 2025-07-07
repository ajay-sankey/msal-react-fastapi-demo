import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import {
  InteractionRequiredAuthError,
  InteractionStatus,
  type IPublicClientApplication,
} from "@azure/msal-browser";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function signInClickHandler(instance: IPublicClientApplication) {
  instance.loginPopup();
}

// SignInButton Component returns a button that invokes a popup sign in when clicked
function SignInButton() {
  // useMsal hook will return the PublicClientApplication instance you provided to MsalProvider
  const { instance } = useMsal();

  return (
    <Button
      className="cursor-pointer"
      onClick={() => signInClickHandler(instance)}
    >
      Sign In
    </Button>
  );
}

function WelcomeUser() {
  const { instance, inProgress, accounts } = useMsal();
  const username = accounts[0].name;
  const [userInfo, setUserInfo] = useState<Record<string, any>>();

  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      const accessTokenRequest = {
        // Microsoft Graph scopes like 'User.Read' typically return v1.0 tokens.
        // To get a v2.0 access token, use a backend API scope instead (e.g., access_as_user).
        scopes: [`api://${import.meta.env.VITE_SERVER_ID}/access_as_user`],
        account: accounts[0],
      };

      instance
        .acquireTokenSilent(accessTokenRequest)
        .then((accessTokenResponse) => {
          // Acquire token silent success
          let accessToken = accessTokenResponse.accessToken;
          // Call your API with token
          fetch(`${import.meta.env.VITE_SERVER_URL}/user-info`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
            .then((response) => response.json())
            .then((data) => setUserInfo(data))
            .catch((error) => console.error(error));
        })
        .catch((error) => {
          if (error instanceof InteractionRequiredAuthError) {
            instance
              .acquireTokenPopup(accessTokenRequest)
              .then((accessTokenResponse) => {
                // Acquire token interactive success
                let accessToken = accessTokenResponse.accessToken;
                // Call your API with token
                fetch(`${import.meta.env.VITE_SERVER_URL}/user-info`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                })
                  .then((response) => response.json())
                  .then((data) => setUserInfo(data))
                  .catch((error) => console.error(error));
              })
              .catch((error) => {
                // Acquire token interactive failure
                console.log(error);
              });
          }
          console.log(error);
        });
    }
  }, [instance, accounts, inProgress]);

  return (
    <Card className="w-96 mb-4">
      <CardHeader>
        <CardTitle className="text-2xl">
          {" "}
          Welcome, {userInfo?.name ?? username}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{userInfo?.email}</p>
      </CardContent>
      <CardFooter>
        <p>{userInfo?.user_id}</p>
      </CardFooter>
    </Card>
  );
}

function signOutClickHandler(instance: IPublicClientApplication) {
  instance.logoutPopup();
}

// SignOutButton component returns a button that invokes a pop-up sign out when clicked
function SignOutButton() {
  // useMsal hook will return the PublicClientApplication instance you provided to MsalProvider
  const { instance } = useMsal();

  return (
    <Button
      variant="destructive"
      className="cursor-pointer"
      onClick={() => signOutClickHandler(instance)}
    >
      Sign Out
    </Button>
  );
}

// Remember that MsalProvider must be rendered somewhere higher up in the component tree
function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <AuthenticatedTemplate>
        <WelcomeUser />
        <SignOutButton />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignInButton />
      </UnauthenticatedTemplate>
    </div>
  );
}
export default App;

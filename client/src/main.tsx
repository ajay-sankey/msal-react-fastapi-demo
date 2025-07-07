import App from "@/app.tsx";
import "@/index.css";
import {
  PublicClientApplication,
  type Configuration,
} from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const config: Configuration = {
  auth: {
    // This is the ONLY mandatory field that you need to supply.
    clientId: import.meta.env.VITE_CLIENT_ID,
    // Replace the placeholder with your tenant info
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_TENANT_ID
    }`,
    // Points to window.location.origin. You must register this URI on Microsoft Entra admin center/App Registration.
    redirectUri: import.meta.env.VITE_CLIENT_URL,
    // Indicates the page to navigate after logout.
    postLogoutRedirectUri: "/",
    // If "true", will navigate back to the original request location before processing the auth code response.
    navigateToLoginRequestUrl: false,
  },
  cache: {
    // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    cacheLocation: "sessionStorage",
    // Set this to "true" if you are having issues on IE11 or Edge
    storeAuthStateInCookie: false,
  },
};

const publicClientApplication = new PublicClientApplication(config);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={publicClientApplication}>
      <App />
    </MsalProvider>
  </StrictMode>
);

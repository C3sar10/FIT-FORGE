import { Amplify } from "@aws-amplify/core";
import {
  signUp,
  signIn,
  confirmSignUp,
  signOut,
  fetchAuthSession,
} from "@aws-amplify/auth";

Amplify.configure({
  auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION ?? "us-west-2",
    userPoolId:
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "us-east-2_sp687kFk6",
    userPoolWebClientId:
      process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "2jmei0drperk70j46pkr5ak2uo",
    authenticationFlowType: "USER_SRP_AUTH",
  },
});

export { signUp, signIn, confirmSignUp, signOut, fetchAuthSession };

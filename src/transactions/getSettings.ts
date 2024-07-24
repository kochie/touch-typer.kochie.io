import { gql } from "@apollo/client";

export const GET_SETTINGS = gql`
  query ($settings: InputSettings!) {
    settings() {
      analytics
      levelName
      keyboardName
      whatsNewOnStartup
    }
  }
`;

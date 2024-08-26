import { gql } from "@apollo/client";

export const GET_SETTINGS = gql`
  query {
    settings {
      analytics
      levelName
      keyboardName
      whatsNewOnStartup
    }
  }
`;

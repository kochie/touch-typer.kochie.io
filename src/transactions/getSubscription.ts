import { gql } from "@apollo/client";

export const GET_SUBSCRIPTIONS = gql`
  query {
    subscription {
      billing_plan
      billing_period
      next_billing_date
      auto_renew
      status
    }
  }
`;

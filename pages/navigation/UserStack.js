import React, { useState } from "react";

import { createStackNavigator } from "@react-navigation/stack";
import UserPage from "../userPage/UserPage";
import Ranking from "../ranking/Ranking";
import RankingStack from "./RankingStack";

const RankingPageStack = createStackNavigator();

export default function UserStack({route, navigation}) {
    const {user} = route.params
  return (
    <RankingPageStack.Navigator>
      <RankingPageStack.Screen
        options={{ headerShown: false }}
        component={UserPage}
        name="UserPage"
        initialParams={{ user }}
      />
      <RankingPageStack.Screen
        options={{ headerShown: false }}
        component={Ranking}
        name="RankingStack"
        initialParams={{uid: user.id}}
      />
    </RankingPageStack.Navigator>
  );
}

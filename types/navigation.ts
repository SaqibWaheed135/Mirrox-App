/**
 * Navigation type definitions for Mirrorx app
 * This file provides TypeScript types for navigation throughout the app
 */

export type RootStackParamList = {
  index: undefined;
  login: undefined;
  '(tabs)': undefined;
  'haircut-details': {
    id: string;
    name: string;
    description: string;
  };
  profile: undefined;
  modal: undefined;
  splash: undefined;
};

export type TabParamList = {
  home: undefined;
  index: undefined;
  profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}


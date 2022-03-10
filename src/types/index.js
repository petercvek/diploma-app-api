// @flow
declare type DataLoader = {
  load: (key: number) => Object,
  loadMany: (keys: Array<number>) => Object,
};

declare type Context = {
  user: {
    id: string,
  },
  dataLoaders: {
    accountLoader: DataLoader,
    activityLoader: DataLoader,
    locationLoader: DataLoader,
    participantLoader: DataLoader,
    navigationLoader: DataLoader,
    stayLoader: DataLoader,
    tripLoader: DataLoader,
    tripParticipantsLoader: DataLoader,
    tripStaysLoader: DataLoader,
    tripActivitiesLoader: DataLoader,
    tripNavigationsLoader: DataLoader,
  },
};

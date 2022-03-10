// @flow
import DataLoader from 'dataloader';

import { accountLoader } from 'schema/Account';
import { activityLoader } from 'schema/Activity';
import { locationLoader } from 'schema/Location';
import { navigationLoader } from 'schema/Navigation';
import { participantLoader } from 'schema/Participant';
import { stayLoader } from 'schema/Stay';
import { tripLoader } from 'schema/Trip';
import { tripParticipantsLoader } from 'schema/Trip/TripParticipants';
import { tripNavigationsLoader } from 'schema/Trip/TripNavigations';
import { tripStaysLoader } from 'schema/Trip/TripStays';
import { tripActivitiesLoader } from 'schema/Trip/TripActivities';

const getDataLoaders = () => ({
  accountLoader: new DataLoader(accountLoader),
  activityLoader: new DataLoader(activityLoader),
  locationLoader: new DataLoader(locationLoader),
  navigationLoader: new DataLoader(navigationLoader),
  participantLoader: new DataLoader(participantLoader),
  stayLoader: new DataLoader(stayLoader),
  tripLoader: new DataLoader(tripLoader),
  tripParticipantsLoader: new DataLoader(tripParticipantsLoader),
  tripNavigationsLoader: new DataLoader(tripNavigationsLoader),
  tripStaysLoader: new DataLoader(tripStaysLoader),
  tripActivitiesLoader: new DataLoader(tripActivitiesLoader),
});

export default getDataLoaders;

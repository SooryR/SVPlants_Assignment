import * as Plantinfos from './PlantInfos';

export interface ApplicationState {
    plantStats: Plantinfos.PlantInfosState | undefined;
}

export const reducers = {
    plantStats: Plantinfos.reducer
};
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}

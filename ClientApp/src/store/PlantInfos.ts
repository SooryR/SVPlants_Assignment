import { Form } from 'reactstrap';
import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
export interface PlantInfosState {
    isLoading: boolean;
    startDateIndex?: number;
    plantIndex?: number;
    plantList: PlantInfo[];
}
export interface PlantInfo {
    lastWatered: string;
    plantId: number;
}
interface RequestPlantInfo {
    type: 'REQUEST_PLANT_INFO';
    startDateIndex: number;
}
interface sendPlantInfo {
    type: 'SEND_PLANT_INFO';
    startDateIndex: number;
    plantList: PlantInfo[];
}
interface WateredPlant {
    type: 'WATERED_PLANT';
    plantInfo: PlantInfo;
}

type KnownAction = RequestPlantInfo | sendPlantInfo | WateredPlant;

export const actionCreators = {
    requestPlantInfos: (startDateIndex: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState();
        if (appState && appState.plantStats && startDateIndex !== appState.plantStats.startDateIndex) {
            fetch(`plant`)
                .then(response => response.json() as Promise<PlantInfo[]>)
                .then(data => {
                    dispatch({ type: 'SEND_PLANT_INFO', startDateIndex: startDateIndex, plantList: data });
                });

            dispatch({ type: 'REQUEST_PLANT_INFO', startDateIndex: startDateIndex });
        }
    },

    sendWateringDate: (plantIndex: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState();
        if (appState && appState.plantStats && plantIndex !== appState.plantStats.plantIndex) {
            var data = new FormData();
            data.append("json", JSON.stringify(plantIndex));
            fetch(`water`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({plantId: plantIndex})
            })
                .then(response => response.json())
                .then(responseFromServer => {
                    dispatch({ 
                        type: 'WATERED_PLANT', 
                        plantInfo: {
                            lastWatered: responseFromServer,
                            plantId: plantIndex,
                        } 
                    });
                });

        }
    }
};

const unloadedState: PlantInfosState = { plantList: [], isLoading: false };

export const reducer: Reducer<PlantInfosState> = (state: PlantInfosState | undefined, incomingAction: Action): PlantInfosState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_PLANT_INFO':
            state.startDateIndex = action.startDateIndex;
            return state;
        case 'WATERED_PLANT':
            const plantIndex = action.plantInfo.plantId;
            const newPlantList = [...state.plantList]
            newPlantList[plantIndex]  = action.plantInfo;
            return {
                ...state,
                plantList: newPlantList,
            };
        case 'SEND_PLANT_INFO':
            if (action.startDateIndex === state.startDateIndex) {
                return {
                    startDateIndex: action.startDateIndex,
                    plantList: action.plantList,
                    isLoading: false
                };
            }
            break;
    }

    return state;
};

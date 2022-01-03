import { Form } from 'reactstrap';
import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface PlantInfosState {
    isLoading: boolean;
    startDateIndex?: number;
    plantIndex?: number;
    forecasts: PlantInfo[];
}

export interface PlantInfo {
    lastWatered: string;
    plantId: number;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestWeatherForecastsAction {
    type: 'REQUEST_WEATHER_FORECASTS';
    startDateIndex: number;
}

interface ReceiveWeatherForecastsAction {
    type: 'RECEIVE_WEATHER_FORECASTS';
    startDateIndex: number;
    forecasts: PlantInfo[];
}

interface sendPlantInfo {
    type: 'SEND_PLANT_INFO';
    startDateIndex: number;
    plantIndex: number;
    forecasts: PlantInfo[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestWeatherForecastsAction | ReceiveWeatherForecastsAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestPlantInfos: (startDateIndex: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState && appState.plantStats && startDateIndex !== appState.plantStats.startDateIndex) {
            fetch(`plant`)
                .then(response => response.json() as Promise<PlantInfo[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_WEATHER_FORECASTS', startDateIndex: startDateIndex, forecasts: data });
                });

            dispatch({ type: 'REQUEST_WEATHER_FORECASTS', startDateIndex: startDateIndex });
        }
    },

    sendWateringDate: (plantIndex: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
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
                    console.log(responseFromServer);
                });

        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: PlantInfosState = { forecasts: [], isLoading: false };

export const reducer: Reducer<PlantInfosState> = (state: PlantInfosState | undefined, incomingAction: Action): PlantInfosState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_WEATHER_FORECASTS':
            return {
                startDateIndex: action.startDateIndex,
                forecasts: state.forecasts,
                isLoading: true
            };
        case 'RECEIVE_WEATHER_FORECASTS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.startDateIndex === state.startDateIndex) {
                return {
                    startDateIndex: action.startDateIndex,
                    forecasts: action.forecasts,
                    isLoading: false
                };
            }
            break;
    }

    return state;
};

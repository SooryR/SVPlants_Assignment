import internal from 'assert';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as PlantStore from '../store/PlantInfos';

type PlantProps =
  PlantStore.PlantInfosState 
  & typeof PlantStore.actionCreators 
  & RouteComponentProps<{ startDateIndex: string }>; 


interface IState {
  currentlyWateringPlantIds: Map<number, boolean>;
  clearTimeoutPlantIds: Map<number, NodeJS.Timeout>
}

class FetchData extends React.PureComponent<PlantProps, IState> {
  
  constructor(props: PlantProps) {
    super(props);
    this.state = {
      currentlyWateringPlantIds:new Map(),
      clearTimeoutPlantIds: new Map()
    };
  }

  public componentDidMount() {
    this.ensureDataFetched();
  }

  public componentDidUpdate() {
    this.ensureDataFetched();
  }

  public render() {
    const plantTable = this.renderPlantTable()
    return (
      <React.Fragment>
        <h1 id="tabelLabel">List of Plants</h1>
        {plantTable}
        <button type="button"
            className="btn btn-primary btn-lg"
            onClick={() => { this.waterAllPlants();}}>
            Start watering All
        </button>
      </React.Fragment>
    );
  }

  private ensureDataFetched() {
    const startDateIndex = parseInt(this.props.match.params.startDateIndex, 10) || 0;
    this.props.requestPlantInfos(startDateIndex);
  }

  public stopWatering(id: number) {
    const timer = this.state.clearTimeoutPlantIds.get(id)
    if (timer) clearTimeout(timer)

    this.setState((prevState) => {
      const newlyWateringPlantIds = new Map(prevState!.currentlyWateringPlantIds)
      newlyWateringPlantIds.delete(id)
      const newTimeouts = new Map(prevState!.clearTimeoutPlantIds)
      newTimeouts.delete(id)
      return { ...prevState, currentlyWateringPlantIds: newlyWateringPlantIds,  clearTimeoutPlantIds: newTimeouts}
    })
  }

  public waterPlant(id: number){
    const timeDifference = (Date.now() - Date.parse(this.props.plantList[id].lastWatered))/1000;
  
    if (timeDifference > 40) {
      this.setState((prevState) => {
        const newlyWateringPlantIds = new Map(prevState!.currentlyWateringPlantIds)
        newlyWateringPlantIds.set(id, true)
        return { currentlyWateringPlantIds: newlyWateringPlantIds }
      })

      const timer = setTimeout(() => {
        this.setState((prevState) => {
          this.props.sendWateringDate(id);
          const newlyWateringPlantIds = new Map(prevState!.currentlyWateringPlantIds)
          newlyWateringPlantIds.delete(id)
          return { ...prevState, currentlyWateringPlantIds: newlyWateringPlantIds }
        })
      },10000);

      this.setState((prevState) => {
        const newTimeouts = new Map(prevState!.clearTimeoutPlantIds)
        newTimeouts.set(id, timer)
        return { ...prevState, clearTimeoutPlantIds: newTimeouts }
      })
    }
    else{
      alert("Plant "+(id+1)+" is on cooldown");
    }
  }

  public waterAllPlants(){
    this.props.plantList.forEach(plant => {
      this.waterPlant(plant.plantId);
    });
  }


  private renderPlantTable() {
    console.log(JSON.stringify(this.props.plantList[0]))
    console.log(this.props.plantList[0])
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Time Watered</th>
            <th>Plant Id</th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.props.plantList.map((plant: PlantStore.PlantInfo) =>
            <tr key={plant.plantId}>
              <td>Date: {plant.lastWatered.replace(/T/g, ' Time: ')}</td>
              <td>{plant.plantId+1}</td>
              <td>
                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.waterPlant(plant.plantId);}}
                    disabled={this.state.currentlyWateringPlantIds.has(plant.plantId)}>
                    Start watering
                </button>
              </td>
              <td>
                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.stopWatering(plant.plantId); }}>
                    Stop watering
                </button>
              </td>
              <td>
                {(Date.now() - Date.parse(plant.lastWatered))/(1000*3600) >= 6 && !(this.state.currentlyWateringPlantIds.has(plant.plantId)) && <p>X</p>}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default connect(
  (state: ApplicationState) => state.plantStats,
  PlantStore.actionCreators
)(FetchData as any);

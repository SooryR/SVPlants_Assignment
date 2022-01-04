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
}

class FetchData extends React.PureComponent<PlantProps, IState> {
  
  constructor(props: PlantProps) {
    super(props);
    this.state = {currentlyWateringPlantIds:new Map()};
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
        {this.renderPagination()}
      </React.Fragment>
    );
  }

  private ensureDataFetched() {
    const startDateIndex = parseInt(this.props.match.params.startDateIndex, 10) || 0;
    this.props.requestPlantInfos(startDateIndex);
  }

  public waterPlant(id: number){
    const timeDifference = (Date.now() - Date.parse(this.props.plantList[id].lastWatered))/1000;
  
    if (timeDifference > 40) {
      this.setState((prevState) => {
        const newlyWateringPlantIds = new Map(prevState!.currentlyWateringPlantIds)
        newlyWateringPlantIds.set(id, true)
        return { currentlyWateringPlantIds: newlyWateringPlantIds }
      })

      setTimeout(() => {
        this.setState((prevState) => {
          this.props.sendWateringDate(id);
          const newlyWateringPlantIds = new Map(prevState!.currentlyWateringPlantIds)
          newlyWateringPlantIds.delete(id)
          return { currentlyWateringPlantIds: newlyWateringPlantIds }
        })
      },10000);
    }
    else{
      alert("Plant is on cooldown");
    }
  }


  private renderPlantTable() {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Time</th>
            <th>Plant Id</th>
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
                    onClick={() => { this.waterPlant(plant.plantId); }}>
                    Stop watering
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  private renderPagination() {
    const prevStartDateIndex = (this.props.startDateIndex || 0) - 5;
    const nextStartDateIndex = (this.props.startDateIndex || 0) + 5;

    return (
      <div className="d-flex justify-content-between">
        <Link className='btn btn-outline-secondary btn-sm' to={`/fetch-data/${prevStartDateIndex}`}>Previous</Link>
        {this.props.isLoading && <span>Loading...</span>}
        <Link className='btn btn-outline-secondary btn-sm' to={`/fetch-data/${nextStartDateIndex}`}>Next</Link>
      </div>
    );
  }
}

export default connect(
  (state: ApplicationState) => state.plantStats, // Selects which state properties are merged into the component's props
  PlantStore.actionCreators // Selects which action creators are merged into the component's props
)(FetchData as any); // eslint-disable-line @typescript-eslint/no-explicit-any

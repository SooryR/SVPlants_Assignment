import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as WeatherForecastsStore from '../store/PlantInfos';

// At runtime, Redux will merge together...
type WeatherForecastProps =
  WeatherForecastsStore.PlantInfosState // ... state we've requested from the Redux store
  & typeof WeatherForecastsStore.actionCreators // ... plus action creators we've requested
  & RouteComponentProps<{ startDateIndex: string }>; // ... plus incoming routing parameters



class FetchData extends React.PureComponent<WeatherForecastProps> {

  // This method is called when the component is first added to the document
  public componentDidMount() {
    this.ensureDataFetched();
  }

  // This method is called when the route parameters change
  public componentDidUpdate() {
    this.ensureDataFetched();
  }

  public render() {
    const forcastTable = this.renderForecastsTable()
    return (
      <React.Fragment>
        <h1 id="tabelLabel">Weather forecast</h1>
        <p>This component demonstrates fetching data from the server and working with URL parameters.</p>
        {forcastTable}
        {this.renderPagination()}
      </React.Fragment>
    );
  }

  private ensureDataFetched() {
    const startDateIndex = parseInt(this.props.match.params.startDateIndex, 10) || 0;
    this.props.requestPlantInfos(startDateIndex);
  }

  public waterPlant(id: number){
    const dateDifference = (Date.now() - Date.parse(this.props.forecasts[id].lastWatered))/1000;
    console.log(dateDifference);
    if (dateDifference > 40) {
      this.props.sendWateringDate(id);
    }
    else{
      alert("not 40 seconds");
    }
  }


  private renderForecastsTable() {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {this.props.forecasts.map((forecast: WeatherForecastsStore.PlantInfo) =>
            <tr key={forecast.plantId}>
              <td id={forecast.plantId.toString()}>{forecast.lastWatered}</td>
              <td>{forecast.plantId}</td>
              <td>
                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.waterPlant(forecast.plantId);}}>
                    Start watering
                </button>
              </td>
              <td>
                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.waterPlant(forecast.plantId); }}>
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
  WeatherForecastsStore.actionCreators // Selects which action creators are merged into the component's props
)(FetchData as any); // eslint-disable-line @typescript-eslint/no-explicit-any

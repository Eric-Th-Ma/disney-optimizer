import './Plan.css';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setLoading, createPlanList } from './planListSlice';
import { getRideInfo, isUpToDate } from '../../utils/funcs'
import loadWaitTimes from '../waitTimeLoad/loadWaitTimes';

function Plan(props) {
  const lastWTUpdate = useSelector((state) => state.waitTimePredicts.lastUpdate)
  const waitTimePredicts = useSelector((state) => state.waitTimePredicts.data)
  const planList = useSelector((state) => state.planList.planList)
  const loading1 = useSelector((state) => state.planList.loading)
  const loading2 = useSelector((state) => state.waitTimePredicts.loading)
  const loading = loading1 || loading2
  const doy = useSelector((state) => state.scheduling.doy)
  const arrive = useSelector((state) => state.scheduling.arrive)
  const depart = useSelector((state) => state.scheduling.depart)
  const doyLoadedFor = useSelector((state) => state.waitTimePredicts.doyFor);
  const tbr = useSelector((state) => state.scheduling.tbr);

  const dispatch = useDispatch();

  const requestBody = {
    arrive: arrive,
    depart: depart,
    rideWaitTimes: waitTimePredicts,
    tbr: tbr,
    rideDict: getRideInfo()
  }

  function makePlans() {
    if (isUpToDate(lastWTUpdate)) {
      const requestPlanOptions = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      };
      dispatch(setLoading())
      fetch('/api/requestPlans', requestPlanOptions).then(res => res.json()).then(data => {
        dispatch(createPlanList(data))
      });
    } else {
      loadWaitTimes(dispatch, doy)
    }
  }

  const doysMatch = doy.y===doyLoadedFor.y && doy.mo===doyLoadedFor.mo && doy.d===doyLoadedFor.d
  let loadButton;
  if (loading) {
    loadButton = <div>Loading...</div>
  } else {
    if (isUpToDate(lastWTUpdate) && doysMatch) {
      loadButton = <button onClick={makePlans}>Make Plans</button>
    } else {
      loadButton = null
    }
  }
  let tableOfPlans
  if (planList.length) {
    tableOfPlans = <table>
        <thead>
          <tr>
            <th>Ride</th>
            <th>Get In Line At</th>
            <th>Get Off Ride At</th>
          </tr>
        </thead>
        <tbody>
          {planList.map(ridePlan => 
            <tr key={ridePlan.rideName}>
              <td key={ridePlan.rideName+'name'}>{getRideInfo()[ridePlan.rideName.replace(/[0-9]/g, '')].rideName}</td>
              <td key={ridePlan.rideName+'timeStart'}>{ridePlan.startTime}</td>
              <td key={ridePlan.rideName+'timeEnd'}>{ridePlan.endTime}</td>
            </tr>
          )}
        </tbody>
      </table>
  } else {
    tableOfPlans = null
  }
  return (
    <div>
      {loadButton}
      {tableOfPlans}
    </div>
  );
}

export default Plan;

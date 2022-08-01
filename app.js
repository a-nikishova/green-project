// STYLE CONSTANTS 
  const SUCCESS_STATUS = 'success';
  const FAIL_STATUS = 'failure';
  const ESTIMATE_STATUS = 'estimate';

  const statusColors = {
    success: '#1da139',
    failure: '#f02929',
    estimate: '#6b6a6a'
  };
  const contractEventColor = '#2943a3';
  const BLUE_COLOR = 'aliceblue';

const itemSize = {width: 10, height: 10};

  // --- GENERATE DATA

  let minPossibleDate = Date.parse('2015-01-01T00:00:00.000Z'); // Jan, 1, 2015
  let maxPossibleDate = Date.parse('2025-12-31T00:00:00.000Z'); // Dec, 31, 2025
  let possibleDateDiff = Date.parse('2015-05-01T00:00:00.000Z') - Date.parse('2015-01-01T00:00:00.000Z'); // 4 months

  let allObjectsData = [];
  for (let i = 0; i < 10; i++){
    let object = {
      objectId: i,
      objectName: 'Объект' + i
    };
    let contractDateArrayInMs = [];
    while(contractDateArrayInMs.length !== 7){
        let date = getRandomMs(minPossibleDate, maxPossibleDate);
        if(contractDateArrayInMs.indexOf(date) === -1){
          contractDateArrayInMs.push(date);
        }
    }
    contractDateArrayInMs.sort(compareNumbers);
    let events = [];
    contractDateArrayInMs.forEach(function(dateInMs, index){
        let event = {
          title: 'Событие' + index,
          contractDate: new Date(dateInMs),
          date: getRealDate(dateInMs)
        };
        let status = getStatus(event.contractDate, event.date);
        event['status'] = status;

        events.push(event);
    })

    object['events'] = events;
    allObjectsData.push(object);
  }

  function getRealDate(dateInMs){
      let realDate = '';
      while(realDate === ''){
        let randomDate = getRandomMs(minPossibleDate, maxPossibleDate);
        if(Math.abs(randomDate - dateInMs) <= possibleDateDiff){
          realDate = new Date(randomDate);
          
        }
      }
      return realDate;
  }

  function getStatus(contractDate, date){
    let diff = Date.parse(contractDate) - Date.parse(date);
    if(date >= new Date){
      return ESTIMATE_STATUS;
    }else{
      return diff >= 0 ? SUCCESS_STATUS : FAIL_STATUS;
    }
  } 

  function getRandomMs(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
  function compareNumbers(a, b){
      return a < b ? -1 : a > b ? 1 : 0;
  }


  //---------MAIN ELEMENTS
const tbody = document.querySelector('table.container tbody');
const firstYearSelect = document.querySelector('select.firstYearSelect');
let lastYearSelect = document.querySelector('select.lastYearSelect');
const checkbox = document.querySelector('div.checkbox');


// ----- MAIN LOGIC
let objectsData = allObjectsData.slice();
let checkboxValues;
const years = getPeriodArray(new Date(minPossibleDate).getFullYear(), new Date(maxPossibleDate). getFullYear());
const minYear = d3.min(years);
const maxYear = d3.max(years);

fillCheckboxes();
fillFirstYearSelect(minYear); //first init  
fillLastYearSelect(); //first init
let firstYearSelected = Number(firstYearSelect[firstYearSelect.selectedIndex].value);
let lastYearSelected = Number(lastYearSelect[lastYearSelect.selectedIndex].value);
let periodArray = getPeriodArray(firstYearSelected, lastYearSelected);
checkboxValues = getCheckboxValues();



// ------------- VALUES FOR CONSTRUCTING
let bodyWidth, objectCell, monthWidth, bodyHeight;
const firstColumnWidthPerc = '10vw';

const svg = d3
  .create('svg')
  .attr('class', 'svgContainer')
  .style('position', 'absolute');

calculateSizes();
tableInit();
let tdHeight = document.querySelector('td.tdYear').clientHeight;
createSvg();


// Insert svg before first <tr> in body (with traslation on first col width)
const firstRow = document.querySelector('table.container tbody tr');
const firstColWidth = firstRow.querySelector('td').clientWidth;
svg.attr('transform', 'translate(' + firstColWidth + ' 0)');
tbody.insertBefore(svg.node(), firstRow);
createLabels();

// Changes control
document.querySelector('select.firstYearSelect').addEventListener('change', function(){
  firstYearSelected = Number(firstYearSelect[firstYearSelect.selectedIndex].value);
  fillLastYearSelect();
  periodArray = getPeriodArray(firstYearSelected, Number(lastYearSelect[lastYearSelect.selectedIndex].value));
  updateObjectsData(periodArray);
  renderTablePlusSvg();
})

document.querySelector('select.lastYearSelect').addEventListener('change', function(){
  lastYearSelected = Number(lastYearSelect[lastYearSelect.selectedIndex].value);
  periodArray = getPeriodArray(Number(firstYearSelect[firstYearSelect.selectedIndex].value), lastYearSelected);
  updateObjectsData(periodArray);
  renderTablePlusSvg();
})

checkbox.addEventListener('change', function(){
  checkboxValues = getCheckboxValues();
  updateObjectsData(null);
  renderTablePlusSvg();
})


function updateObjectsData(yearsArray){

  const filterByCheckedObjects = (value) => {
    return checkboxValues.indexOf(value.objectName) !== -1;
  }

  objectsData = [];
  let array = allObjectsData.filter(filterByCheckedObjects); 
  
  if(yearsArray !== null){

    const firstYear = yearsArray[0];
    const lastYear = yearsArray[yearsArray.length - 1];
    const filterByFirstLastYear = (value) => {
      let a = (value.date.getFullYear() >= firstYear || value.contractDate.getFullYear() >= firstYear) && (value.date.getFullYear() <= lastYear || value.contractDate.getFullYear() <= lastYear);
      return a;
    }

    array.forEach(function(object){
      let newObject = {
        objectId: object.objectId,
        objectName: object.objectName,
        status: object.status
      };
      let filteredEvents = object.events.filter(filterByFirstLastYear);
      newObject.events = filteredEvents;
      objectsData.push(newObject);
    })
  }else{
    objectsData = array.slice();
  }  
}


function calculateSizes(){
  bodyWidth = document.querySelector('table.container tbody').clientWidth;
  objectCell = {width: bodyWidth/periodArray.length, height: 200};
  monthWidth = objectCell.width/12;
  bodyHeight = objectsData.length * objectCell.height;
  svg.attr('width', bodyWidth).attr('height', bodyHeight);
}

function renderTablePlusSvg(){

  calculateSizes();
  tableInit();
  createSvg();

  const firstRow = document.querySelector('table.container tbody tr');
  const firstColWidth = firstRow.querySelector('td').clientWidth;
  svg.attr('transform', 'translate(' + firstColWidth + ' 0)');
  tbody.insertBefore(svg.node(), firstRow);
  createLabels();
}

function fillFirstYearSelect(minYear){
  const firstYearArray = getPeriodArray(minYear, maxYear);
  firstYearArray.forEach(function(year){
      firstYearSelect[firstYearSelect.length] = new Option(year, year);
  });
}

function fillLastYearSelect(){

  let currentSelectedLast = lastYearSelect[lastYearSelect.selectedIndex];
  let currentSelectedFirst = firstYearSelect[firstYearSelect.selectedIndex];
  const lastYearArray = getPeriodArray(Number(firstYearSelect[firstYearSelect.selectedIndex].value) + 1, maxYear);
  lastYearSelect.length = 0;
  lastYearArray.forEach(function(year){
    lastYearSelect[lastYearSelect.length] = new Option(year, year);
  });
  
  if(currentSelectedLast !== undefined && Number(currentSelectedLast.value) > Number(currentSelectedFirst.value)){
      for(let i = 0; i < lastYearSelect.options.length; i++){
        if(lastYearSelect.options[i].value == new String(Number(currentSelectedLast.value))){
          lastYearSelect.options[i].selected = true;
        }
      }
  }
}

function getPeriodArray(minYear, maxYear){
  let array = [minYear];
  let i = 1;
  while(array.indexOf(maxYear) < 0){
      array[i] = array[i-1] + 1;
      i++;
  }
  return array;
}

function fillCheckboxes(){
  objectsData.forEach(function(obj){
    let span = document.createElement('span');
    let input = document.createElement('input');
    input.type = 'checkbox';
    input.value = obj.objectName;
    input.name = 'objects';
    input.checked = true;
    let label = document.createElement('label');
    label.for = 'objects';
    label.innerHTML = obj.objectName;
    span.appendChild(input);
    span.appendChild(label);
    checkbox.appendChild(span);
  })
}

function getCheckboxValues(){
  const values = Array
  .from(document.querySelectorAll('input[type="checkbox"]'))
  .filter((checkbox) => checkbox.checked)
  .map((checkbox) => checkbox.value);

  return values;
}



//------------ CREATION EVENTS SVG
function createSvg(){

  svg.selectAll('g').remove();

  const eventsGroup = svg.append('g')
  .attr('class', 'eventsGroup');

  let objEventsGroup, eventsPair, contractEventItem, eventItem, eventLink;
  
  objectsData.forEach(function(obj, index){
      
    objEventsGroup = eventsGroup
    .append('g')
    .attr('class', 'objEventsGroup');

    let contractBaseLine = objEventsGroup.append('g');
    contractBaseLine.append('line')
    .attr('x1', calcItemX(new Date(obj.events[0].contractDate)))
    .attr('y1', calcContractItemY(index) + itemSize.height*Math.sqrt(2)/2)
    .attr('x2', calcItemX(new Date(obj.events[obj.events.length - 1].contractDate)))
    .attr('y2', calcContractItemY(index) + itemSize.height*Math.sqrt(2)/2)
    .attr('class', 'baseLine');
  
    let baseLine = objEventsGroup.append('g');
    baseLine.append('line')
    .attr('x1', calcItemX(new Date(obj.events[0].date)))
    .attr('y1', calcItemY(index) + itemSize.height*Math.sqrt(2)/2)
    .attr('x2', calcItemX(new Date(obj.events[obj.events.length - 1].date)))
    .attr('y2', calcItemY(index) + itemSize.height*Math.sqrt(2)/2)
    .attr('class', 'baseLine');
  
    eventsPair = objEventsGroup
    .selectAll('g.eventsPair' + obj.objectId)
    .data(obj.events)
    .join('g')
    .attr('class', 'eventsPair' + obj.objectId);
   
    contractEventItem = eventsPair.append('g'); // Contract date item
    contractEventItem
    .append('rect')
    .attr('class', e => 'contract' + obj.events.indexOf(e))
    .attr('fill', contractEventColor)
    .attr('x', e => calcItemX(new Date(e.contractDate)))
    .attr('y', calcContractItemY(index))
    .attr('transform', e => 'rotate(45 ' + calcItemX(new Date(e.contractDate)) + ' ' + calcContractItemY(index) + ')');
  
    eventItem = eventsPair.append('g');  // Real date item  
    eventItem
    .append('rect')
    .attr('class', e => 'real' + obj.events.indexOf(e))
    .attr('fill', e => getStatusColor(e.status))
    .attr('x', e => calcItemX(new Date(e.date)))
    .attr('y', calcItemY(index))
    .attr('transform', e => 'rotate(45 ' + calcItemX(new Date(e.date)) + ' ' + calcItemY(index) + ')');
  
    eventLink = eventsPair.append('g'); // Line between items
    eventLink
    .append('line')
    .attr('x1', e => calcItemX(new Date(e.contractDate)))
    .attr('y1', calcContractItemY(index) + itemSize.height*Math.sqrt(2))
    .attr('x2', e => calcItemX(new Date(e.date)))
    .attr('y2', calcItemY(index))
    .attr('class', 'dashEventLink');

  })
}


function createLabels (){

  const labelsGroup = svg.append('g')
  .attr('class', 'labelsGroup');

objectsData.forEach(function(obj, index){
  
  let objLabelsGroup = labelsGroup.append('g')
  .attr('class', 'objLabels');

  let labelsPairs = objLabelsGroup
  .selectAll('g.objLabelsGroup' + obj.objectId)
  .data(obj.events)
  .join('g')
  .attr('class', 'objLabelsGroup' + obj.objectId);

  let contractLabel = labelsPairs.append('g');
  contractLabel
  .append('text')
  .style('font-size', 18)
  .attr('class', 'dateLabel')
  .text(e => e.title)
  .attr('x', e => getRectCoordinates('eventsPair' + obj.objectId, 'contract' + obj.events.indexOf(e)).x + 15)
  .attr('y',  e => getRectCoordinates('eventsPair' + obj.objectId, 'contract' + obj.events.indexOf(e)).y - 15);

  let contractDateLabel = contractLabel
  .append('text')
  .text(e => e.contractDate.toLocaleDateString())
  .attr('class', 'dateLabel')
  .style('font-size', 14)
  .attr('x', e => getRectCoordinates('eventsPair' + obj.objectId, 'contract' + obj.events.indexOf(e)).x + 15)
  .attr('y', e => getRectCoordinates('eventsPair' + obj.objectId, 'contract' + obj.events.indexOf(e)).y);

  let realDateLabel = labelsPairs.append('g');
  realDateLabel
  .append('text')
  .attr('class', 'dateLabel')
  .style('font-size', 18)
  .text(e => e.title)
  .attr('x', e => getRectCoordinates('eventsPair' + obj.objectId, 'real' + obj.events.indexOf(e)).x + 15)
  .attr('y',  e => getRectCoordinates('eventsPair' + obj.objectId, 'real' + obj.events.indexOf(e)).y + 10);

  let dateLabel = realDateLabel
  .append('text')
  .text(e => e.date.toLocaleDateString())
  .attr('class', 'dateLabel')
  .style('font-size', 14)
  .attr('x', e => getRectCoordinates('eventsPair' + obj.objectId, 'real' + obj.events.indexOf(e)).x + 15)
  .attr('y', e => getRectCoordinates('eventsPair' + obj.objectId, 'real' + obj.events.indexOf(e)).y + 25);

})

}


function getRectCoordinates(eventsPairClass, contractClass){
   return document.querySelector('g.' + eventsPairClass + ' rect.' + contractClass).getBBox();
}

function calcItemX (date){
  return (date.getFullYear() - firstYearSelected)* objectCell.width + (date.getMonth() + 1) * monthWidth - monthWidth/2;
}

function calcItemY (currentId){
  let y = 0.75 * tdHeight;
  if(currentId > 0){
    y = y + currentId*tdHeight;
  }
  return y;
}

function calcContractItemY(currentId){
  let y = 0.25*tdHeight;
  if(currentId > 0){
    y = y + currentId*tdHeight;
  }
  return y;
}

function getStatusColor(status){
    return statusColors[status];
}


// --------- TABLE INITIALIZATION
function tableInit(){   
const thead = document.querySelector('table.container thead');
thead.deleteRow(0);
const theadRow = document.createElement('tr');
thead.appendChild(theadRow);
let nullTd = document.createElement('td');
theadRow.appendChild(nullTd);

periodArray.forEach(function(year){
    let th = document.createElement('th');
    th.innerHTML = year;
    th.style.width = objectCell.width + 'px';
    th.style.height = 100 + 'px';
    theadRow.appendChild(th);
})

// Remove old content
while(tbody.rows.length !== 0){
  tbody.deleteRow(0);
}

objectsData.forEach(function(obj){
  let bodyRow = document.createElement('tr');
  let thObjectName = document.createElement('td');
  thObjectName.innerHTML = obj.objectName;
  thObjectName.style.maxWidth = firstColumnWidthPerc;
  thObjectName.style.width = firstColumnWidthPerc;

  bodyRow.appendChild(thObjectName);


  periodArray.forEach(function(year){
    let tdYear = document.createElement('td');
     tdYear.style.width = objectCell.width + 'px';
     tdYear.style.height = objectCell.height + 'px';
     tdYear.style.backgroundColor = getColorByYear(year);
     tdYear.classList.add('tdYear');

     tdYear.append(createSplittedCell());
     bodyRow.append(tdYear);
  })

  tbody.appendChild(bodyRow);
})
}

function getColorByYear(year){
  return (new Date()).getFullYear() === year ? 'white' : BLUE_COLOR; 
}

function createSplittedCell(){
  const table = document.createElement('table');
  table.classList.add('splittedCell');
  table.style.width = objectCell.width + 'px';
  table.style.height = objectCell.height + 'px';
  for(let i = 0; i < 2; i++){
      let tr = document.createElement('tr');
      let td = document.createElement('td');
      tr.appendChild(td);
      table.appendChild(tr);
  }
  return table;
}

function printTable() {
  let tableToPrint = document.body;
  let newWindow = window.open('', '', 'height=1000, width=1000');
  newWindow.document.write('<html><head>');
  newWindow.document.write('<link rel="stylesheet" href="styles.css">');
  newWindow.document.write('</head><body><div>');
  newWindow.document.write(tableToPrint.innerHTML);
  newWindow.document.write('</div></body>');
  newWindow.document.close();

  newWindow.print();
  newWindow.close(); 
}

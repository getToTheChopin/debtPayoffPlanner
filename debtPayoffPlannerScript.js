var addLoanButton = document.getElementById("addLoanButton");

var loanAssumptionTable = document.getElementById("loanAssumptionTable");

var loanNameInputArray= [];
var loanBalanceInputArray = [];
var interestRateInputArray = [];
var minPaymentInputArray = [];

var maxMonths = 600;

var monthlyPayment = 0;
var paymentType;

var numLoans = 0;

var nilInputCount = 0;

var loanBOPArray = [];
var loanPaymentArray = [];
var loanInterestPaidArray = [];
var loanPrincipalPaidArray = [];
var loanEOPArray = [];

var totalDebtBOPArray = [];
var totalDebtEOPArray = [];

var monthLabelArray = [];
var loanPayoffMonthArray = [];

var totalInterestByLoanArray = [];
var totalPrincipalByLoanArray = [];

var paymentChange2 = 10;
var paymentChange3 = 50;
var paymentChange4 = 100;
var paymentChange5 = 0;

var numMonths = 0;

var chart;
var chart2;
var chart3;
var chartActive = false;

var whatIfAnalysisToggle = false;

var userMessageDiv = document.getElementById("userMessageDiv");

var outputMasterDiv = document.getElementById("outputMasterDiv");

var outputErrorDiv = document.getElementById("outputErrorDiv");
var outputTextDiv = document.getElementById("outputTextDiv");
var summaryTableDiv = document.getElementById("summaryTableDiv"); 
var chartDiv = document.getElementById("chartDiv"); 
var loanTableDiv = document.getElementById("loanTableDiv");

var loanTableDisplayToggleArray = [];

var generateURLButton = document.getElementById("generateURLButton");
var customURLOutput = document.getElementById("customURLOutput");

var importLoanToggle = false;

//Final answers
var debtFreeDate = new Date();
var debtFreeDateString = "";
var totalInterestPaid = 0;
var totalPrincipalPaid = 0;


//main method
getURLValues();
getUserInputs();
generateCustomURL();
displayUserMessage();
calculateDebts();
whatIfAnalysis();
whatIfAnalysis2();

function getURLValues () {
    var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
    
    var numLoansImport = Math.floor((hashParams.length-1)/4);
    console.log("Num loans import: "+numLoansImport);

    importLoanToggle = true;

    for(q=0; q<numLoansImport; q++){
        addLoan();
    }

    importLoanToggle = false;
    
    console.log(hashParams);
    if(hashParams[0] === "") {
        return;
    }

    for(i=0; i <hashParams.length; i++){
        console.log(hashParams.length);
        var p = hashParams[i].split('=');

        document.getElementById(p[0]).value = decodeURIComponent(p[1]);
    }

    /*
    cleanAnalysis();
    getUserInputs();
    */
}

function generateCustomURL() {

    generateURLButton.addEventListener('click', function() {

        var customURL = [location.protocol, '//', location.host, location.pathname].join('');
        console.log("Custom URL: "+customURL);

        var inputsArray = document.getElementsByClassName("userInput");

        for(i=0; i<inputsArray.length; i++){
            if(i == 0){
                customURL += "#"+inputsArray[i].id+"="+inputsArray[i].value;
            } else{
                customURL += "&"+inputsArray[i].id+"="+inputsArray[i].value; 
            }
        }
       
        customURLOutput.innerHTML = customURL;
        copyToClipboard('customURLOutput');

    }, false);

}

function addLoan(){

    console.log("Add loan");

    numLoans ++;

    var newRow = loanAssumptionTable.insertRow(-1);
    var rowNum = newRow.rowIndex;

    var firstCell = newRow.insertCell(0);
    firstCell.innerHTML = "<span>Loan<br>Name<br></span><input id=\"loanNameRow"+rowNum+"\" type=\"text\" class=\"userInput input-number–noSpinners loanNameInput\" placeholder=\"Student loan\">";

    var secondCell = newRow.insertCell(1);
    secondCell.innerHTML = "<span>Loan balance<br>($)<br></span><input id=\"loanBalanceRow"+rowNum+"\" type=\"number\" class=\"userInput input-number–noSpinners loanBalanceInput\" placeholder=\"8000\" step=\"0.01\" min=\"0\">";

    var thirdCell = newRow.insertCell(2);
    thirdCell.innerHTML = "<span>Annual Interest Rate (%)<br></span><input id=\"interestRateRow"+rowNum+"\" type=\"number\" class=\"userInput input-number–noSpinners interestRateInput\" placeholder=\"6\" step=\"0.01\" min=\"0\">";

    var fourthCell = newRow.insertCell(3);
    fourthCell.innerHTML = "<span>Minimum Monthly Payment ($)<br></span><input id=\"minMonthlyPaymentRow"+rowNum+"\" type=\"number\" class=\"userInput input-number–noSpinners minPaymentInput\" placeholder=\"50\" step=\"0.01\" min=\"0\">";

    var fifthCell = newRow.insertCell(4);
    fifthCell.className = "deleteCell";
    fifthCell.innerHTML = "<span class=\"deleteIcon\" onclick=\"deleteLoan("+rowNum+")\">&#10008</span>";

    var inputsArray = document.getElementsByClassName("userInput");
    for(i=0;i<inputsArray.length;i++) {
        inputsArray[i].addEventListener('change',refreshAnalysis, false);
        console.log("add input event listener");
    }

    var inputsArray2 = document.getElementsByClassName("userInput2");
    for(i=0;i<inputsArray2.length;i++) {
        inputsArray2[i].addEventListener('change',refreshAnalysis, false);
        console.log("add input event listener");
    }

    if(importLoanToggle == false){
        console.log("Refresh analysis from add loan function");
        refreshAnalysis();
    }

}

function deleteLoan(j){

    numLoans --;

    console.log("Delete row:" +j);
    loanAssumptionTable.deleteRow(j);

    rowArray = document.getElementsByClassName("deleteCell");

    //Update row reference of delete icons in the loan assumption table
    for(i=0; i<rowArray.length; i++){
        rowArray[i].innerHTML = "<span class=\"deleteIcon\" onclick=\"deleteLoan("+i+")\">&#10008</span>";
    }

    refreshAnalysis();
}

function getUserInputs(){

    outputErrorDiv.classList.add("hide");

    var inputsArray = document.getElementsByClassName("loanNameInput");

    for(i=0; i<inputsArray.length; i++){
        loanNameInputArray[i] = inputsArray[i].value;
    }

    inputsArray = document.getElementsByClassName("loanBalanceInput");

    for(i=0; i<inputsArray.length; i++){
        loanBalanceInputArray[i] = Number(inputsArray[i].value);
        
        //check if input hasn't been set yet
        if(!inputsArray[i].value){
            nilInputCount ++;
        }
    }

    inputsArray = document.getElementsByClassName("interestRateInput");

    for(i=0; i<inputsArray.length; i++){
        interestRateInputArray[i] = Number(inputsArray[i].value)/100;

        //check if input hasn't been set yet
        if(!inputsArray[i].value){
            nilInputCount ++;
        }
    }

    inputsArray = document.getElementsByClassName("minPaymentInput");

    var minPaymentTotal = 0;
    for(i=0; i<inputsArray.length; i++){
        minPaymentInputArray[i] = Number(inputsArray[i].value);
        minPaymentTotal += Number(inputsArray[i].value);
    
        //check if input hasn't been set yet
        if(!inputsArray[i].value){
            nilInputCount ++;
        }
    }

    monthlyPayment = Number(document.getElementById("monthlyPaymentInput").value);

    //set monthly payment user input cell to greater of current value and min payment total
    if(monthlyPayment < minPaymentTotal){
        document.getElementById("monthlyPaymentInput").value = minPaymentTotal;
        monthlyPayment = minPaymentTotal;
    }
    
    if(document.getElementById("avalancheType").checked){
        paymentType = "avalanche";
    } else {
        paymentType = "snowball";
    }

    //set event listener on what-if custom payment cell
    var inputsArray3 = document.getElementsByClassName("userInput3");
    for(i=0;i<inputsArray3.length;i++) {
        inputsArray3[i].addEventListener('change',whatIfAnalysis2, false);
        console.log("add input event listener");
    }

}

function refreshAnalysis(){
    console.log("refresh analysis");

    cleanAnalysis();

    if(chartActive == false){
    
    } else if(chartActive == true) {
        chart.destroy();
        chart2.destroy();
        chart3.destroy();
    }

    getUserInputs();
    displayUserMessage();
    calculateDebts();
    whatIfAnalysis();
    whatIfAnalysis2();
}

function cleanAnalysis(){

    loanNameInputArray.length = 0;
    loanBalanceInputArray.length = 0;
    interestRateInputArray.length = 0;
    minPaymentInputArray.length = 0;

    loanBOPArray.length = 0;
    loanPaymentArray.length = 0;
    loanInterestPaidArray.length = 0;
    loanPrincipalPaidArray.length = 0;
    loanEOPArray.length = 0;
    
    loanPayoffMonthArray.length = 0;
    monthLabelArray.length = 0;

    totalDebtBOPArray.length = 0;
    totalDebtEOPArray.length = 0;

    totalInterestByLoanArray.length = 0;
    totalPrincipalByLoanArray.length = 0;

    debtFreeDateString = "";

    debtFreeDate = new Date();
    totalInterestPaid = 0;
    totalPrincipalPaid = 0;

    numMonths = 0;

    nilInputCount = 0;

    if(whatIfAnalysisToggle == false){
        outputTextDiv.innerHTML = "";
        summaryTableDiv.innerHTML = "";
        loanTableDiv.innerHTML = "";
        outputErrorDiv.classList.add("hide");

        document.getElementById("monthlyPaymentDeltaInput").value = "";
        paymentChange5 = 0;

        //reset what if analysis tables
        document.getElementById("avalancheTotalInterestPaid").innerHTML = "";
        document.getElementById("snowballTotalInterestPaid").innerHTML = "";
        document.getElementById("differenceTotalInterestPaid").innerHTML = "";

        document.getElementById("avalancheDebtFreeDate").innerHTML = "";
        document.getElementById("snowballDebtFreeDate").innerHTML = "";
        document.getElementById("differenceDebtFreeDate").innerHTML = "";

        document.getElementById("newMonthlyPayment1").innerHTML = "";
        document.getElementById("newTotalInterestPaid1").innerHTML = "";
        document.getElementById("newDebtFreeDate1").innerHTML = "";
        
        document.getElementById("newMonthlyPayment2").innerHTML = "";
        document.getElementById("newTotalInterestPaid2").innerHTML = "";
        document.getElementById("newDebtFreeDate2").innerHTML = "";
        
        document.getElementById("newMonthlyPayment3").innerHTML = "";
        document.getElementById("newTotalInterestPaid3").innerHTML = "";
        document.getElementById("newDebtFreeDate3").innerHTML = "";
        
        document.getElementById("newMonthlyPayment4").innerHTML = "";
        document.getElementById("newTotalInterestPaid4").innerHTML = "";
        document.getElementById("newDebtFreeDate4").innerHTML = "";
        
        document.getElementById("newMonthlyPayment5").innerHTML = "";
        document.getElementById("newTotalInterestPaid5").innerHTML = "";
        document.getElementById("newDebtFreeDate5").innerHTML = "";
    }

}

function displayUserMessage(){

    console.log("Nil input count: "+nilInputCount);

    if(numLoans == 0){
        var noLoanPara = document.createElement("p");
        noLoanPara.innerHTML = "Click the <span id=\"addLoanSpan\">+ Add Loan</span> button above to get started!";
        userMessageDiv.innerHTML = "";
        userMessageDiv.appendChild(noLoanPara);
        userMessageDiv.classList.remove("hide");

        outputMasterDiv.classList.add("hide");

    } else if(nilInputCount > 0){
        var nilInputPara = document.createElement("p");
        nilInputPara.innerHTML = "Missing data... please fill in the loan inputs above!";
        userMessageDiv.innerHTML = "";
        userMessageDiv.appendChild(nilInputPara);
        userMessageDiv.classList.remove("hide");

        outputMasterDiv.classList.add("hide");  

    } else {
        userMessageDiv.innerHTML = "";

        userMessageDiv.classList.add("hide");

        outputMasterDiv.classList.remove("hide");
            
    }
}

function calculateDebts(){

    //Exit if monthly payment is not set
    if(monthlyPayment == 0 || isNaN(monthlyPayment)){
        return;
    }

    //Exit if loan inputs are not filled in
    if(nilInputCount > 0){
        return;
    }

    var selectedRanking = [];

    var avalancheRanking = [];
    var avalancheRankingUnique = [];

    var rateSorted = interestRateInputArray.slice().sort(function(a,b){return b-a});
    avalancheRanking = interestRateInputArray.slice().map(function(v){ return rateSorted.indexOf(v)+1 });

    for(i=0; i<avalancheRanking.length; i++){
        var current = avalancheRanking[i];
        var count = 0;
        for(j=0;j<i;j++){
            if(avalancheRanking[j]==current){
                count++;
            }
        }
        avalancheRankingUnique[i] = current + count;
    }

    //Create 2d arrays for the variables which will be shown in the output tables (all months)
    for(i=0; i<numLoans; i++){
        loanBOPArray[i] = [];
        loanPaymentArray[i] = [];
        loanInterestPaidArray[i] = [];
        loanPrincipalPaidArray[i] = [];
        loanEOPArray[i] = [];
        totalInterestByLoanArray[i] = 0;
        totalPrincipalByLoanArray[i] = 0;
    }

    for(i=0; i<maxMonths; i++){

        //console.log("Month count: "+i);

        totalDebtBOPArray[i] = 0;
        totalDebtEOPArray[i] = 0;

        //fill in array for month labels
        var currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth()+i);
        monthLabelArray[i] = formatDateAsString(currentDate);

        var adjMinPaymentArray = [];
        var currentMonthEligibleExcessArray = [];
        
        var snowballRanking = [];
        var snowballRankingUnique = [];

        var totalAdjustedMinPayment = 0;
        var excessPayment = 0;

        for(j=0; j<numLoans; j++){
            
            if(i==0){
                loanBOPArray[j][i] = loanBalanceInputArray[j];
            } else{
                loanBOPArray[j][i] = loanEOPArray[j][i-1];
            }

            totalDebtBOPArray[i] += loanBOPArray[j][i];

            loanInterestPaidArray[j][i] = loanBOPArray[j][i] * interestRateInputArray[j] / 12;

            adjMinPaymentArray[j] = Math.min(loanBOPArray[j][i]+loanInterestPaidArray[j][i],minPaymentInputArray[j]);

            totalAdjustedMinPayment += adjMinPaymentArray[j];

            currentMonthEligibleExcessArray[j] = loanBOPArray[j][i] + loanInterestPaidArray[j][i] - adjMinPaymentArray[j];
        }

        //Exit month-by-month loop if all loans are paid off
        var zeroCount = 0;
        for(j=0; j<numLoans; j++){
            var currentLoanBalance = loanBOPArray[j][i];

            if(currentLoanBalance == 0){
                zeroCount ++;
            }
        }

        if(zeroCount == numLoans){
            break;
        }

        //display error message if there is at least one loan not paid off by the end of the calc period
        if(i == maxMonths-1){
            outputErrorDiv.classList.remove("hide");
        }

        //Algorithm to allocate excess payment amongst the outstanding loans
        excessPayment = monthlyPayment - totalAdjustedMinPayment;

        var excessEligibleSorted = currentMonthEligibleExcessArray.slice().sort(function(a,b){return a-b});
        snowballRanking = currentMonthEligibleExcessArray.slice().map(function(v){ return excessEligibleSorted.indexOf(v)+1 });

        for(a=0; a<snowballRanking.length; a++){
            var current = snowballRanking[a];
            var count = 0;
            for(b=0;b<a;b++){
                if(snowballRanking[b]==current){
                    count++;
                }
            }
            snowballRankingUnique[a] = current + count;
        }

        if(paymentType == "avalanche"){
            selectedRanking = avalancheRankingUnique.slice();
        } else {
            selectedRanking = snowballRankingUnique.slice();
        }

        //console.log("Selected Ranking: "+selectedRanking);

        var currentMonthEligibleExcessArraySorted = [];
 
        for (k=0; k<currentMonthEligibleExcessArray.length; k++){
            var currentRank = k+1;
            currentMonthEligibleExcessArraySorted[k] = currentMonthEligibleExcessArray[selectedRanking.indexOf(currentRank)];
        }

        var excessPaymentArraySorted = [];
        var excessPaymentRunningTotal = 0;

        //console.log("Excess Payment: "+excessPayment);

        for(m=0; m<currentMonthEligibleExcessArraySorted.length; m++){
            var currentExcessPaymentAllocation;

            currentExcessPaymentAllocation = Math.max(0,Math.min(excessPayment - excessPaymentRunningTotal, currentMonthEligibleExcessArraySorted[m]));
            excessPaymentRunningTotal += currentExcessPaymentAllocation;

            excessPaymentArraySorted[m] = currentExcessPaymentAllocation;
        }

        var excessPaymentArrayUserOrder = [];

        for (n=0; n<excessPaymentArraySorted.length; n++){
            excessPaymentArrayUserOrder[n] = excessPaymentArraySorted[selectedRanking[n]-1];
        }

        var currentMonthLoanPaymentArray = []
       
        for(p=0; p<numLoans; p++){
            currentMonthLoanPaymentArray[p] = adjMinPaymentArray[p] + excessPaymentArrayUserOrder[p];
        }

        //console.log("Total Loan Payment array: "+currentMonthLoanPaymentArray);  

        for(q=0; q<numLoans; q++){

            loanPaymentArray[q][i] = currentMonthLoanPaymentArray[q];    
            loanPrincipalPaidArray[q][i] = currentMonthLoanPaymentArray[q] - loanInterestPaidArray[q][i];
            loanEOPArray[q][i] = loanBOPArray[q][i] - loanPrincipalPaidArray[q][i];

            totalInterestPaid += loanInterestPaidArray[q][i];
            totalPrincipalPaid += loanPrincipalPaidArray[q][i];
            
            totalInterestByLoanArray[q] += loanInterestPaidArray[q][i];
            totalPrincipalByLoanArray[q] += loanPrincipalPaidArray[q][i];

            totalDebtEOPArray[i] += loanEOPArray[q][i];

            if(loanEOPArray[q][i]==0 && loanBOPArray[q][i]>0){
                loanPayoffMonthArray[q] = i+1;
            }
        }    
    }

    numMonths = loanBOPArray[0].length-1;

    //calc final debt free date
    debtFreeDate.setMonth(debtFreeDate.getMonth() + numMonths);
    debtFreeDateString = formatDateAsString(debtFreeDate);

    //exit loop if what if analysis is being run, so that charts and tables do not re-populate
    if(whatIfAnalysisToggle == true){
        return;
    }

    //display final answer outputs
    showOutputs();

    //Make sure that the every loan has a payoff month so that tables will fill no matter what
    for(y=0; y<numLoans; y++){
        if(isNaN(loanPayoffMonthArray[y])){
            loanPayoffMonthArray[y] = maxMonths;
        }
    }

    //Create loan tables
    for(x=0; x<numLoans; x++){
        loanTableDisplayToggleArray[x] = 0;
        createDebtTables(x, loanPayoffMonthArray[x]);
    }
}

function showOutputs(){

    //fill outputTextDiv
    var outputTextPara = document.createElement("p");
    outputTextPara.innerHTML = "You will be debt free in <span class=\"highlightText\">"+debtFreeDateString+"</span> ("+numMonths+" months from now)";
    outputTextDiv.appendChild(outputTextPara);

    var outputTextPara2 = document.createElement("p");
    outputTextPara2.innerHTML = "Total interest paid: <span class=\"highlightText\">$"+(Math.round(totalInterestPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })+"</span>";
    outputTextDiv.appendChild(outputTextPara2);

    var outputTextPara3 = document.createElement("p");
    outputTextPara3.innerHTML = "Total principal paid: <span class=\"highlightText\">$"+(Math.round(totalPrincipalPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })+"</span>";
    outputTextDiv.appendChild(outputTextPara3);

    var outputTextPara4 = document.createElement("p");
    outputTextPara4.innerHTML = "Grand total cost: <span class=\"highlightText\">$"+(Math.round((totalInterestPaid+totalPrincipalPaid)*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })+"</span>";
    outputTextDiv.appendChild(outputTextPara4);

    createSummaryTable();

    chartActive = true;

    //set tick spacing for chart x-axis
    var tickSpacing = 0;
    
    if(numMonths <= 48){
        tickSpacing = 2;
    } else if(numMonths <=96){
        tickSpacing = 4;
    } else if(numMonths <=144){
        tickSpacing = 6;
    } else if(numMonths <= 240){
        tickSpacing = 12;
    } else {
        tickSpacing = 24;
    }

    //draw total loan balance line chart with chart.js

    var ctx = document.getElementById('totalBalanceChart').getContext('2d');

    chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: monthLabelArray,
            datasets: [
                {
                    label: "Total Loan Balance",
                    data: totalDebtBOPArray,
                    pointBackgroundColor: "rgb(0, 121, 129)",
                    backgroundColor: "rgb(0, 121, 129, 0.2)",
                    borderWidth: 2,
                    borderStyle: "solid",
                },
            ]
        },
    
        // Configuration options go here
        options: {

            maintainAspectRatio: false,
        
            tooltips: {
                
                // Include a dollar sign in the ticks and add comma formatting
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += '$'+tooltipItem.yLabel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                        return label;
                    }
                },
            },

            scales: {
                yAxes: [{
                    ticks: {
                        // Include a dollar sign in the ticks and add comma formatting
                        callback: function(value, index, values) {
                            return '$' + (value.toFixed(0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })+" ";
                        },

                        fontColor: "rgb(56,56,56)",
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Total Loan Balance",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],

                xAxes: [{
                    ticks: {
                        userCallback: function(item, index) {
                            if (!(index % tickSpacing)) return item+" ";
                        },

                        autoSkip: false,
                        fontColor: "rgb(56,56,56)",

                        maxRotation: 90,
                        minRotation: 90, 
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],    
            },

            legend: {
                labels: {
                    fontColor: "rgb(56,56,56)",
                    boxWidth: 13,
                    padding: 10,
                },
            },

            title: {
                display: true,
                text: "Total Loan Balance",
                fontSize: 18,
                fontColor: "rgb(56,56,56)",
                padding: 2,
            },

        }
    });

    //draw loan balance line chart with chart.js
    var colours = [ '#2685CB', '#4AD95A', '#FEC81B', '#FD8D14', '#CE00E6', '#4B4AD3', '#FC3026', '#B8CCE3', '#6ADC88', '#FEE45F'  ];

    var dataSetData2 = [];
    
    for(var i=0; i<numLoans; i++) {
        dataSetData2[i] = {
            label:loanNameInputArray[i],
            data: loanBOPArray[i],
            backgroundColor: colours[i],
            hoverBackgroundColor: colours[i],
            borderStyle: 'solid',
            borderWidth: 2,
            fill: false,
        }
    }

    var ctx2 = document.getElementById('loanBalanceChart').getContext('2d');

    chart2 = new Chart(ctx2, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: monthLabelArray,
            datasets: dataSetData2
        },
    
        // Configuration options go here
        options: {

            maintainAspectRatio: false,
        
            tooltips: {
                
                // Include a dollar sign in the ticks and add comma formatting
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += '$'+tooltipItem.yLabel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                        return label;
                    }
                },
            },

            scales: {
                yAxes: [{
                    ticks: {
                        // Include a dollar sign in the ticks and add comma formatting
                        callback: function(value, index, values) {
                            return '$' + (value.toFixed(0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })+" ";
                        },

                        fontColor: "rgb(56,56,56)",
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Loan Balance",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],

                xAxes: [{
                    ticks: {
                        userCallback: function(item, index) {
                            if (!(index % tickSpacing)) return item+" ";
                        },
                        autoSkip: false,
                        fontColor: "rgb(56,56,56)",

                        maxRotation: 90,
                        minRotation: 90, 
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],    
            },

            legend: {
                labels: {
                    fontColor: "rgb(56,56,56)",
                    boxWidth: 13,
                    padding: 10,
                },
            },

            title: {
                display: true,
                text: "Loan Balances",
                fontSize: 18,
                fontColor: "rgb(56,56,56)",
                padding: 2,
            },

        }
    });

    //draw payment stacked bar chart with chart.js

    var dataSetData3 = [];
    
    for(var i=0; i<numLoans; i++) {
        dataSetData3[i] = {
            label:loanNameInputArray[i],
            data: loanPaymentArray[i],
            backgroundColor: colours[i],
        }
    }

    var ctx3 = document.getElementById('loanPaymentChart').getContext('2d');

    chart3 = new Chart(ctx3, {
        // The type of chart we want to create
        type: 'bar',
    
        // The data for our dataset
        data: {
            labels: monthLabelArray,
            datasets: dataSetData3
        },
    
        // Configuration options go here
        options: {

            maintainAspectRatio: false,
        
            tooltips: {
                
                // Include a dollar sign in the ticks and add comma formatting
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += '$'+tooltipItem.yLabel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                        return label;
                    }
                },
            },

            scales: {
                yAxes: [{
                    ticks: {
                        // Include a dollar sign in the ticks and add comma formatting
                        callback: function(value, index, values) {
                            return '$' + (value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })+" ";
                        },

                        fontColor: "rgb(56,56,56)",
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Loan Payment",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },

                    stacked: true,

                }],

                xAxes: [{
                    ticks: {
                        userCallback: function(item, index) {
                            if (!(index % tickSpacing)) return item+" ";
                        },
                        autoSkip: false,
                        fontColor: "rgb(56,56,56)",

                        maxRotation: 90,
                        minRotation: 90, 
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },

                    stacked: true,

                }],    
            },

            legend: {
                labels: {
                    fontColor: "rgb(56,56,56)",
                    boxWidth: 13,
                    padding: 10,
                },
            },

            title: {
                display: true,
                text: "Monthly Loan Payments",
                fontSize: 18,
                fontColor: "rgb(56,56,56)",
                padding: 2,
            },

        }
    });


}

function createSummaryTable(){
    //create table
    var summaryTable = document.createElement('table');
    summaryTable.classList.add("summaryTable");

    //Add header row with titles
    var summaryTable1 = document.createElement('tr');
    
    var summaryTable1a = document.createElement('th');
    var summaryTable1b = document.createElement('th');
    var summaryTable1c = document.createElement('th');
    var summaryTable1d = document.createElement('th');
    var summaryTable1e = document.createElement('th');

    summaryTable1c.classList.add("rightAlignCell");
    summaryTable1d.classList.add("rightAlignCell");
    summaryTable1e.classList.add("rightAlignCell");


    summaryTable1a.textContent = "Loan Name";
    summaryTable1b.textContent = "Debt-Free Date";
    summaryTable1c.textContent = "Total Interest Paid";
    summaryTable1d.textContent = "Total Principal Paid";
    summaryTable1e.textContent = "Grand Total Cost";

    summaryTable1.appendChild(summaryTable1a);
    summaryTable1.appendChild(summaryTable1b);
    summaryTable1.appendChild(summaryTable1c);
    summaryTable1.appendChild(summaryTable1d);
    summaryTable1.appendChild(summaryTable1e);

    summaryTable.appendChild(summaryTable1);

    var numberOfCol = 5;

    for(i=0; i<=numLoans; i++) {

        var tableRow = document.createElement('tr');
        tableRow.classList.add("tableRow");
        tableRow.setAttribute('id','row'+(i+1));        
        summaryTable.appendChild(tableRow);

        for(j=0; j<numberOfCol; j++) {
            var tableCell = document.createElement('td');
            tableCell.classList.add("tableCell");
            tableCell.setAttribute('id','row'+(i+1)+'col'+(j+1));        
            tableRow.appendChild(tableCell);

            if(j === 0) {
                if(i === numLoans){
                    tableCell.innerHTML = "Total";
                    tableCell.classList.add("tableHighlightRow");                    
                } else{
                    tableCell.innerHTML = loanNameInputArray[i];
                }
            }

            else if(j === 1) {
                if(i === numLoans){
                    tableCell.innerHTML = formatDateAsString(debtFreeDate);
                    tableCell.classList.add("tableHighlightRow");                    
                } else{
                    var currentDate = new Date();
                    currentDate.setMonth(currentDate.getMonth()+loanPayoffMonthArray[i]);
                    tableCell.innerHTML = formatDateAsString(currentDate);
                }
            }

            else if(j === 2) {
                tableCell.classList.add("rightAlignCell");

                if(i === numLoans){
                    tableCell.innerHTML = "$"+(Math.round(totalInterestPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });                    
                    tableCell.classList.add("tableHighlightRow");                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(totalInterestByLoanArray[i]*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                }
            }

            else if(j === 3) {
                tableCell.classList.add("rightAlignCell");

                if(i === numLoans){
                    tableCell.innerHTML = "$"+(Math.round(totalPrincipalPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });                    
                    tableCell.classList.add("tableHighlightRow");                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(totalPrincipalByLoanArray[i]*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                }
            }

            else if(j === 4) {
                tableCell.classList.add("rightAlignCell");

                if(i === numLoans){
                    tableCell.innerHTML = "$"+(Math.round((totalInterestPaid+totalPrincipalPaid)*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });                    
                    tableCell.classList.add("tableHighlightRow");                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round((totalInterestByLoanArray[i]+totalPrincipalByLoanArray[i])*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                }
            }
        }
    }

    summaryTableDiv.appendChild(summaryTable);
}

function createDebtTables(currentLoanNum, currentPayoffMonth){

    //create table title
    var titleSpan = document.createElement("span");
    titleSpan.classList.add("loanTableTitle");

    var title = document.createTextNode(loanNameInputArray[currentLoanNum]+" - Payment Table   ");
    titleSpan.appendChild(title);
    loanTableDiv.appendChild(titleSpan);

    //place plus or minus symbol beside the title for the loan table, allows user to toggle the table on or off
    var symbolSpan = document.createElement("span");
    symbolSpan.classList.add("loanTableSymbol");
    symbolSpan.innerHTML = "&#x002B;"
    loanTableDiv.appendChild(symbolSpan);
    symbolSpan.onclick = function(){
        var currentTable = document.getElementById("loanTable"+currentLoanNum);
        //console.log("Toggle loan table: "+currentLoanNum);
        if(loanTableDisplayToggleArray[currentLoanNum] == 0){
            //console.log("Change display style to block");
            currentTable.style.display = "block";
            loanTableDisplayToggleArray[currentLoanNum] = 1;
            this.innerHTML = "&#8722;";
        } else if(loanTableDisplayToggleArray[currentLoanNum] == 1){
            //console.log("Change display style to none");
            currentTable.style.display = "none";
            loanTableDisplayToggleArray[currentLoanNum] = 0;
            this.innerHTML = "&#x002B;"
        }
    };

    var breakSpan = document.createElement("span");
    breakSpan.innerHTML = "<br><br>";
    loanTableDiv.appendChild(breakSpan);

    //create table
    var loanTable = document.createElement('table');
    loanTable.classList.add("loanTable");
    loanTable.setAttribute("id", "loanTable"+currentLoanNum);

    //Add header row with titles
    var loanTable1 = document.createElement('tr');
    
    var loanTable1a = document.createElement('th');
    var loanTable1b = document.createElement('th');
    var loanTable1c = document.createElement('th');
    var loanTable1d = document.createElement('th');
    var loanTable1e = document.createElement('th');

    loanTable1b.classList.add("rightAlignCell");
    loanTable1c.classList.add("rightAlignCell");
    loanTable1d.classList.add("rightAlignCell");
    loanTable1e.classList.add("rightAlignCell");

    loanTable1a.textContent = "Month";
    loanTable1b.textContent = "Payment";
    loanTable1c.textContent = "Interest Paid";
    loanTable1d.textContent = "Principal Paid";
    loanTable1e.textContent = "Loan Balance";

    loanTable1.appendChild(loanTable1a);
    loanTable1.appendChild(loanTable1b);
    loanTable1.appendChild(loanTable1c);
    loanTable1.appendChild(loanTable1d);
    loanTable1.appendChild(loanTable1e);

    loanTable.appendChild(loanTable1);

    var numberOfCol = 5;

    for(i=0; i<=currentPayoffMonth; i++) {

        var tableRow = document.createElement('tr');
        tableRow.classList.add("tableRow");
        tableRow.setAttribute('id','row'+(i+1));        
        loanTable.appendChild(tableRow);

        
        for(j=0; j<numberOfCol; j++) {
            var tableCell = document.createElement('td');
            tableCell.classList.add("tableCell");
            tableCell.setAttribute('id','row'+(i+1)+'col'+(j+1));        
            tableRow.appendChild(tableCell);

            if(j === 0) {
                var currentMonth = new Date();
                currentMonth.setMonth(currentMonth.getMonth()+i);
                var currentMonthString = formatDateAsString(currentMonth);
                tableCell.innerHTML = currentMonthString; 
            }

            else if(j === 1) {
                tableCell.classList.add("rightAlignCell");

                if(i === 0){
                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanPaymentArray[currentLoanNum][i-1]*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                }
            }

            else if(j === 2) {
                tableCell.classList.add("rightAlignCell");

                if(i === 0){
                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanInterestPaidArray[currentLoanNum][i-1]*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                }
            }

            else if(j === 3) {
                tableCell.classList.add("rightAlignCell");

                if(i === 0){
                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanPrincipalPaidArray[currentLoanNum][i-1]*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
                }         
            }

            else if(j === 4) {
                tableCell.classList.add("rightAlignCell");
                tableCell.classList.add("loanBalanceCell");

                if(i === 0){
                    tableCell.innerHTML = "$"+(Math.round(loanBOPArray[currentLoanNum][i]*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });               
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanEOPArray[currentLoanNum][i-1]*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });               
                }             
            }
        }
    }
    loanTableDiv.appendChild(loanTable);
    loanTable.style.display = "none";
}

//formats date value as mmm-yyyy
function formatDateAsString(date){
    var month = date.getMonth();
    //getYear gives year minus 1900
    var year = date.getYear() + 1900;
    
    var monthLabel = "";

    if(month == 0){
        monthLabel = "Jan";
    } else if(month == 1){
        monthLabel = "Feb";
    } else if(month == 2){
        monthLabel = "Mar";
    } else if(month == 3){
        monthLabel = "Apr";
    } else if(month == 4){
        monthLabel = "May";
    } else if(month == 5){
        monthLabel = "Jun";
    } else if(month == 6){
        monthLabel = "Jul";
    } else if(month == 7){
        monthLabel = "Aug";
    } else if(month == 8){
        monthLabel = "Sep";
    } else if(month == 9){
        monthLabel = "Oct";
    } else if(month == 10){
        monthLabel = "Nov";
    } else if(month == 11){
        monthLabel = "Dec";
    }

    return monthLabel+"-"+year;
}

function whatIfAnalysis(){

    paymentTypeCopy = paymentType;
    monthlyPaymentCopy = monthlyPayment;
    totalInterestPaidCopy = totalInterestPaid;
    debtFreeDateStringCopy = debtFreeDateString;
    whatIfAnalysisToggle = true;

    //avalanche vs snowball analysis
    var avalancheTotalInterest = 0;
    var snowballTotalInterest = 0;
    var differenceTotalInterest = 0;

    var avalancheDebtFreeDateString = "";
    var snowballDebtFreeDateString = "";

    var avalancheNumMonths = 0;
    var snowballNumMonths = 0;
    var differenceNumMonths = 0;

    if(paymentType == "avalanche"){
        avalancheTotalInterest = totalInterestPaid;
        avalancheDebtFreeDateString = debtFreeDateString;
        avalancheNumMonths = numMonths;

        cleanAnalysis();
        getUserInputs();
        paymentType = "snowball";
        calculateDebts();

        snowballTotalInterest = totalInterestPaid;
        snowballDebtFreeDateString = debtFreeDateString;
        snowballNumMonths = numMonths;
    } else {
        snowballTotalInterest = totalInterestPaid;
        snowballDebtFreeDateString = debtFreeDateString;
        snowballNumMonths = numMonths;

        cleanAnalysis();
        getUserInputs();
        paymentType = "avalanche";
        calculateDebts();

        avalancheTotalInterest = totalInterestPaid;
        avalancheDebtFreeDateString = debtFreeDateString;
        avalancheNumMonths = numMonths;
    }

    differenceTotalInterest = snowballTotalInterest - avalancheTotalInterest;
    differenceNumMonths = snowballNumMonths - avalancheNumMonths;

    //fill avalanche vs snowball table
    document.getElementById("avalancheTotalInterestPaid").innerHTML = "$"+(Math.round(avalancheTotalInterest*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("snowballTotalInterestPaid").innerHTML = "$"+(Math.round(snowballTotalInterest*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("differenceTotalInterestPaid").innerHTML = "$"+(Math.round(differenceTotalInterest*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });

    document.getElementById("avalancheDebtFreeDate").innerHTML = avalancheDebtFreeDateString;
    document.getElementById("snowballDebtFreeDate").innerHTML = snowballDebtFreeDateString;
    document.getElementById("differenceDebtFreeDate").innerHTML = differenceNumMonths + " months";

    //reset inputs to status quo values
    cleanAnalysis();
    getUserInputs();
    calculateDebts();
    whatIfAnalysisToggle = false;
}

function whatIfAnalysis2(){

    paymentTypeCopy = paymentType;
    monthlyPaymentCopy = monthlyPayment;
    totalInterestPaidCopy = totalInterestPaid;
    debtFreeDateStringCopy = debtFreeDateString;
    whatIfAnalysisToggle = true;

    //Change in monthly payment analysis
    var newMonthlyPayment = 0;
    var newTotalInterestPaid = 0;
    var newDebtFreeDateString = "";

    paymentChange5 = Number(document.getElementById("monthlyPaymentDeltaInput").value);
    
    //row 1
    document.getElementById("newMonthlyPayment1").innerHTML = "$"+(Math.round(monthlyPaymentCopy*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newTotalInterestPaid1").innerHTML = "$"+(Math.round(totalInterestPaidCopy*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newDebtFreeDate1").innerHTML = debtFreeDateString;

    //row 2
    cleanAnalysis();
    getUserInputs();
    monthlyPayment = monthlyPaymentCopy + paymentChange2;
    calculateDebts();

    newMonthlyPayment = monthlyPaymentCopy + paymentChange2;
    newTotalInterestPaid = totalInterestPaid;
    newDebtFreeDateString = debtFreeDateString;

    document.getElementById("newMonthlyPayment2").innerHTML = "$"+(Math.round(newMonthlyPayment*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newTotalInterestPaid2").innerHTML = "$"+(Math.round(newTotalInterestPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newDebtFreeDate2").innerHTML = newDebtFreeDateString;
    
    //row 3
    cleanAnalysis();
    getUserInputs();
    monthlyPayment = monthlyPaymentCopy + paymentChange3;
    calculateDebts();

    newMonthlyPayment = monthlyPaymentCopy + paymentChange3;
    newTotalInterestPaid = totalInterestPaid;
    newDebtFreeDateString = debtFreeDateString;

    document.getElementById("newMonthlyPayment3").innerHTML = "$"+(Math.round(newMonthlyPayment*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newTotalInterestPaid3").innerHTML = "$"+(Math.round(newTotalInterestPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newDebtFreeDate3").innerHTML = newDebtFreeDateString; 

    //row 4
    cleanAnalysis();
    getUserInputs();
    monthlyPayment = monthlyPaymentCopy + paymentChange4;
    calculateDebts();

    newMonthlyPayment = monthlyPaymentCopy + paymentChange4;
    newTotalInterestPaid = totalInterestPaid;
    newDebtFreeDateString = debtFreeDateString;

    document.getElementById("newMonthlyPayment4").innerHTML = "$"+(Math.round(newMonthlyPayment*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newTotalInterestPaid4").innerHTML = "$"+(Math.round(newTotalInterestPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
    document.getElementById("newDebtFreeDate4").innerHTML = newDebtFreeDateString;

    //row 5
    if(paymentChange5 && paymentChange5 > 0){
        cleanAnalysis();
        getUserInputs();
        monthlyPayment = monthlyPaymentCopy + paymentChange5;
        calculateDebts();
    
        newMonthlyPayment = monthlyPaymentCopy + paymentChange5;
        newTotalInterestPaid = totalInterestPaid;
        newDebtFreeDateString = debtFreeDateString;
    
        document.getElementById("newMonthlyPayment5").innerHTML = "$"+(Math.round(newMonthlyPayment*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
        document.getElementById("newTotalInterestPaid5").innerHTML = "$"+(Math.round(newTotalInterestPaid*100)/100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, });
        document.getElementById("newDebtFreeDate5").innerHTML = newDebtFreeDateString;
    } else{
        document.getElementById("newMonthlyPayment5").innerHTML = "";
        document.getElementById("newTotalInterestPaid5").innerHTML = "";
        document.getElementById("newDebtFreeDate5").innerHTML = "";        
    }

    //reset inputs to status quo values
    cleanAnalysis();
    getUserInputs();
    calculateDebts();
    whatIfAnalysisToggle = false;

}
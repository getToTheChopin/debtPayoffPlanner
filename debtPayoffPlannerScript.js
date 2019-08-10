/*
To be added:
- Don't do any calculations or show any outputs if the inputs are not fully filled in (show message instead that loan info is missing)
- Add chart.js graphs
- Add ability to delete loans
- Add ability to show / hide detailed loan tables
- Add section for what if analysis (avalanche vs snowball comparison, what if monthly payment is higher by +$1 / +$10 / +$100 / custom)
*/

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

var loanBOPArray = [];
var loanPaymentArray = [];
var loanInterestPaidArray = [];
var loanPrincipalPaidArray = [];
var loanEOPArray = [];

var loanPayoffMonthArray = [];

var totalInterestByLoanArray = [];
var totalPrincipalByLoanArray = [];

var numMonths = 0;

var outputTextDiv = document.getElementById("outputTextDiv");
var summaryTableDiv = document.getElementById("summaryTableDiv"); 
var loanTableDiv = document.getElementById("loanTableDiv");

//Final answers
var debtFreeDate = new Date();
var totalInterestPaid = 0;
var totalPrincipalPaid = 0;


//main method
getUserInputs();
calculateDebts();

function addLoan(){
    var newRow = loanAssumptionTable.insertRow(-1);

    var firstCell = newRow.insertCell(0);
    firstCell.innerHTML = "<span>Loan Name: </span><input type=\"text\" class=\"userInput loanNameInput\">";

    var secondCell = newRow.insertCell(1);
    secondCell.innerHTML = "<span>Loan balance ($): </span><input type=\"number\" class=\"userInput loanBalanceInput\">";

    var thirdCell = newRow.insertCell(2);
    thirdCell.innerHTML = "<span>Annual Interest Rate (%): </span><input type=\"number\" class=\"userInput interestRateInput\">";

    var fourthCell = newRow.insertCell(3);
    fourthCell.innerHTML = "<span>Minimum Monthly Payment ($): </span><input type=\"number\" class=\"userInput minPaymentInput\">";

    var inputsArray = document.getElementsByClassName("userInput");

    for(i=0;i<inputsArray.length;i++) {
        inputsArray[i].addEventListener('change',refreshAnalysis, false);
        console.log("add input event listener");
    }

}

function getUserInputs(){

    var inputsArray = document.getElementsByClassName("loanNameInput");

    for(i=0; i<inputsArray.length; i++){
        loanNameInputArray[i] = inputsArray[i].value;
    }

    inputsArray = document.getElementsByClassName("loanBalanceInput");

    for(i=0; i<inputsArray.length; i++){
        loanBalanceInputArray[i] = Number(inputsArray[i].value);
    }

    inputsArray = document.getElementsByClassName("interestRateInput");

    for(i=0; i<inputsArray.length; i++){
        interestRateInputArray[i] = Number(inputsArray[i].value)/100;
    }

    inputsArray = document.getElementsByClassName("minPaymentInput");

    var minPaymentTotal = 0;
    for(i=0; i<inputsArray.length; i++){
        minPaymentInputArray[i] = Number(inputsArray[i].value);
        minPaymentTotal += Number(inputsArray[i].value);
    }

    numLoans = inputsArray.length;


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


}

function refreshAnalysis(){
    console.log("refresh analysis");

    loanBOPArray.length = 0;
    loanPaymentArray.length = 0;
    loanInterestPaidArray.length = 0;
    loanPrincipalPaidArray.length = 0;
    loanEOPArray.length = 0;

    loanPayoffMonthArray.length = 0;

    outputTextDiv.innerHTML = "";
    summaryTableDiv.innerHTML = "";
    loanTableDiv.innerHTML = "";

    debtFreeDate = new Date();
    totalInterestPaid = 0;
    totalPrincipalPaid = 0;

    numMonths = 0;

    getUserInputs();
    calculateDebts();
}

function calculateDebts(){

    //Exit if monthly payment is not set
    if(monthlyPayment == 0 || isNaN(monthlyPayment)){
        return;
    }

    console.log("Monthly Payment: "+monthlyPayment);
    console.log("Payment Type: "+paymentType);

    console.log(loanNameInputArray);
    console.log(loanBalanceInputArray);
    console.log(interestRateInputArray);
    console.log(minPaymentInputArray);

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

        console.log("Month count: "+i);

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

        console.log("Selected Ranking: "+selectedRanking);

        var currentMonthEligibleExcessArraySorted = [];
 
        for (k=0; k<currentMonthEligibleExcessArray.length; k++){
            var currentRank = k+1;
            currentMonthEligibleExcessArraySorted[k] = currentMonthEligibleExcessArray[selectedRanking.indexOf(currentRank)];
        }

        var excessPaymentArraySorted = [];
        var excessPaymentRunningTotal = 0;

        console.log("Excess Payment: "+excessPayment);

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

        console.log("Total Loan Payment array: "+currentMonthLoanPaymentArray);  

        for(q=0; q<numLoans; q++){

            loanPaymentArray[q][i] = currentMonthLoanPaymentArray[q];    
            loanPrincipalPaidArray[q][i] = currentMonthLoanPaymentArray[q] - loanInterestPaidArray[q][i];
            loanEOPArray[q][i] = loanBOPArray[q][i] - loanPrincipalPaidArray[q][i];

            totalInterestPaid += loanInterestPaidArray[q][i];
            totalPrincipalPaid += loanPrincipalPaidArray[q][i];
            
            totalInterestByLoanArray[q] += loanInterestPaidArray[q][i];
            totalPrincipalByLoanArray[q] += loanPrincipalPaidArray[q][i];

            if(loanEOPArray[q][i]==0 && loanBOPArray[q][i]>0){
                loanPayoffMonthArray[q] = i+1;
            }
        }    
    }

    numMonths = loanBOPArray[0].length-1;

    //display final answer outputs
    showOutputs();

    //Make sure that the every loan has a payoff month so that tables will fill no matter what
    for(y=0; y<numLoans; y++){
        if(isNaN(loanPayoffMonthArray[y])){
            loanPayoffMonthArray[y] = maxMonths;
        }
    }

    //Create loan tables
    console.log("Number of loans: "+numLoans);
    for(x=0; x<numLoans; x++){
        console.log("X value: "+x);
        createDebtTables(x, loanPayoffMonthArray[x]);
    }
}

function showOutputs(){

    //fill outputTextDiv
    console.log("Debt free date: "+debtFreeDate);
    debtFreeDate.setMonth(debtFreeDate.getMonth() + numMonths);
    console.log("Debt free date: "+debtFreeDate);

    var debtFreeDateString = formatDateAsString(debtFreeDate);
    var outputTextString = "You will be debt free in "+debtFreeDateString+" ("+numMonths+" months from now)";

    var outputTextPara = document.createElement("p");
    outputTextPara.textContent = outputTextString;
    outputTextDiv.appendChild(outputTextPara);

    var outputTextPara2 = document.createElement("p");
    outputTextPara2.textContent = "Total interest paid: $"+(Math.round(totalInterestPaid*100)/100).toLocaleString();
    outputTextDiv.appendChild(outputTextPara2);

    var outputTextPara3 = document.createElement("p");
    outputTextPara3.textContent = "Total principal paid: $"+(Math.round(totalPrincipalPaid*100)/100).toLocaleString();
    outputTextDiv.appendChild(outputTextPara3);

    var outputTextPara4 = document.createElement("p");
    outputTextPara4.textContent = "Grand total cost: $"+(Math.round((totalInterestPaid+totalPrincipalPaid)*100)/100).toLocaleString();
    outputTextDiv.appendChild(outputTextPara4);

    createSummaryTable();

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
                } else{
                    tableCell.innerHTML = loanNameInputArray[i];
                }
            }

            else if(j === 1) {
                if(i === numLoans){
                    tableCell.innerHTML = formatDateAsString(debtFreeDate);                    
                } else{
                    var currentDate = new Date();
                    currentDate.setMonth(currentDate.getMonth()+loanPayoffMonthArray[i]);
                    tableCell.innerHTML = formatDateAsString(currentDate);
                }
            }

            else if(j === 2) {
                if(i === numLoans){
                    tableCell.innerHTML = "$"+(Math.round(totalInterestPaid*100)/100).toLocaleString();                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(totalInterestByLoanArray[i]*100)/100).toLocaleString();
                }
            }

            else if(j === 3) {
                if(i === numLoans){
                    tableCell.innerHTML = "$"+(Math.round(totalPrincipalPaid*100)/100).toLocaleString();                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(totalPrincipalByLoanArray[i]*100)/100).toLocaleString();
                }
            }

            else if(j === 4) {
                if(i === numLoans){
                    tableCell.innerHTML = "$"+(Math.round((totalInterestPaid+totalPrincipalPaid)*100)/100).toLocaleString();                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round((totalInterestByLoanArray[i]+totalPrincipalByLoanArray[i])*100)/100).toLocaleString();
                }
            }
        }
    }

    summaryTableDiv.appendChild(summaryTable);
}

function createDebtTables(currentLoanNum, currentPayoffMonth){

    console.log("Create table "+currentLoanNum);

    //create table title
    var para = document.createElement("p");
    para.classList.add("loanTableTitle");

    var title = document.createTextNode(loanNameInputArray[currentLoanNum]+" - Payment Table");
    para.appendChild(title);

    loanTableDiv.appendChild(para);

    //create table
    var loanTable = document.createElement('table');
    loanTable.classList.add("loanTable");

    //Add header row with titles
    var loanTable1 = document.createElement('tr');
    
    var loanTable1a = document.createElement('th');
    var loanTable1b = document.createElement('th');
    var loanTable1c = document.createElement('th');
    var loanTable1d = document.createElement('th');
    var loanTable1e = document.createElement('th');

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
                if(i === 0){
                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanPaymentArray[currentLoanNum][i-1]*100)/100).toLocaleString();
                }
            }

            else if(j === 2) {
                if(i === 0){
                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanInterestPaidArray[currentLoanNum][i-1]*100)/100).toLocaleString();
                }
            }

            else if(j === 3) {
                if(i === 0){
                    
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanPrincipalPaidArray[currentLoanNum][i-1]*100)/100).toLocaleString();
                }         
            }

            else if(j === 4) {
                if(i === 0){
                    tableCell.innerHTML = "$"+(Math.round(loanBOPArray[currentLoanNum][i]*100)/100).toLocaleString();               
                } else{
                    tableCell.innerHTML = "$"+(Math.round(loanEOPArray[currentLoanNum][i-1]*100)/100).toLocaleString();               
                }             
            }
        }
    }

    loanTableDiv.appendChild(loanTable);

}

function formatDateAsString(date){
    var month = date.getMonth();
    //getYear gives year minus 1900
    var year = date.getYear() + 1900;

    console.log("Month: "+month);
    console.log("Year: "+year);
    
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
var addLoanButton = document.getElementById("addLoanButton");

var loanAssumptionTable = document.getElementById("loanAssumptionTable");

var loanNameInputArray= [];
var loanBalanceInputArray = [];
var interestRateInputArray = [];
var minPaymentInputArray = [];

var monthlyPayment = 0;
var paymentType;

var numLoans = 0;

var loanBOPArray = [];
var loanPaymentArray = [];
var loanInterestPaidArray = [];
var loanPrincipalPaidArray = [];
var loanEOPArray = [];

var numMonths = 0;

var loanTableDiv = document.getElementById("loanTableDiv");


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

    /*
    var loanTables = document.getElementsByClassName("loanTable");
    for(i=0; i<loanTables.length; i++){
        loanTables[i].parentNode.removeChild(loanTables[i]);
    }
    */

    loanTableDiv.innerHTML = "";

    getUserInputs();
    calculateDebts();
}

function calculateDebts(){

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
    }

    for(i=0; i<600; i++){

        //Exit loop if monthly payment is not set
        if(monthlyPayment == 0 || isNaN(monthlyPayment)){
            break;
        }

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
        }    
    }

    numMonths = loanBOPArray[0].length;

    //Create loan tables
    console.log("Number of loans: "+numLoans);
    for(x=0; x<numLoans; x++){
        console.log("X value: "+x);
        createDebtTables(x);
    }
}

function createDebtTables(currentLoanNum){

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


    for(i=0; i<numMonths; i++) {

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
                tableCell.innerHTML = "Month "+i; 
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




var ba = null;
var accountID = null;
var handler = Dapi.create({
    environment: Dapi.environments.sandbox, //or .production
    appKey: "4e1c41d5e6edafdf705b790d7e37e4d43731562b35abcf15eb62312f8bb3b456", 
    countries: ["AE"],
    bundleID: "com.bigr", // bundleID you set on Dashboard
    clientUserID: "1",  
    isCachedEnabled: true,
    isExperimental: false,
    clientHeaders: {},
    clientBody: {},
    onSuccessfulLogin: function(bankAccount) {
        $('#dapiOn').fadeOut(1000);
        $('#dapiOff').addClass('text-success').html('<i class="fa fa-check-square-o font-20"></i> Integration Done').fadeIn(2000);
        $('#dapi-auth').html('<span class="spinner-border spinner-border-sm text-info"></span> We are authenticating').fadeIn(1000);
        
        ba = bankAccount;
        // To get acoutn details
        ba.data.getAccounts().then(payload => {
            ba.showAccountsModal(
            "Your account details",
            payload.accounts,
            (account) => {
                $('#dapi-auth').addClass('text-success').html('<i class="fa fa-check-square-o font-20"></i> Authentication Done').fadeIn(1000);
                accountID = account.id;
                // console.dir(account)
                getIntervalTransactions();
            },
            () => {
                console.dir("User Cancelled")
            })
        })
        
    },
    onFailedLogin: function(err) {
        if (err != null) {
            console.log("Error",err);
        } else {
            console.log("No error");
        }
    },
    onReady: function() {
        $('#dapiOn').removeAttr('disabled');
        $('#dapi-loading').fadeOut(1000);
    },
    onExit: function() {
        console.log("User exited the flow")
    },
    onAuthModalOpen: function() {
        console.log("MFA modal opened")
    },
    onAuthModalSubmit: function() {
        console.log("MFA answer submitted")
    }
});

$('#dapiOn').on('click', () => {
    handler.open();
});

function getIntervalTransactions(start_date=null, end_date=null){
    if(ba){
        $('#dapi-transaction').html('<span class="spinner-border spinner-border-sm text-info"></span> We are analyzing your transactions').fadeIn(1000);
        if(start_date === null && end_date === null){
            end_date = moment().endOf('month');
            start_date = moment().startOf('month').subtract(5, 'months');
        }
        let monthDiff = Math.floor(end_date.diff(start_date, "months", "true"));
        ba.data.getTransactions(accountID, start_date.format('YYYY-MM-DD'), end_date.format('YYYY-MM-DD')).then(transactionsResponse => {
            if(transactionsResponse.status === "done") {
                let transHtml = '';
                let creditDistinct = [];
                let creditTransaction = (transactionsResponse.transactions).filter(item => item.type === "credit");
                for(let i=0; i<creditTransaction.length; i++){
                    let objIndex = creditDistinct.findIndex(item => item.details === creditTransaction[i].details); 
                    if(objIndex >= 0){
                        creditDistinct[objIndex].count++;
                    }else{
                        creditDistinct.push({
                            name: creditTransaction[i].description,
                            details: creditTransaction[i].details,
                            count: 1
                        })
                    }
                }
                creditDistinct.filter(item => item.count === monthDiff).map((item, i) => {
                    transHtml += '<tr>\
                            <td>'+(i+1)+'</td>\
                            <td>'+item.name+'</td>\
                            <td>'+item.details+'</td>\
                            <td>'+item.count+'</td>\
                            </tr>';
                })
                $('#creditTimes').html(transHtml);
                // console.log(creditDistinct)
            } else {
                console.error("API Responded with an error")
                console.dir(transactionsResponse)
            }
            $('#dapi-transaction').addClass('text-success').html('<i class="fa fa-check-square-o font-20"></i> Transactions Analysis Done').fadeIn();
        })
        .catch(error => {
            console.dir(error)
            $('#dapi-transaction').html('<i class="fa fa-exclamation-circle font-20"></i> Transactions Analysis Failed').fadeIn();
        })
    }else{
        alert('First login in to your bank account')
    }
}
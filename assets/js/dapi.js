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
        $('#dapiOff').addClass('text-success').html('<i class="fa fa-check"></i> Integration Done').show();
        $('#dapi-auth').html('<span class="spinner-border spinner-border-sm text-info"></span> We are authenticating').show();
        $('#dapiOn').hide();
        ba = bankAccount;
        console.log(ba)
        // To get acoutn details
        ba.data.getAccounts().then(payload => {
            ba.showAccountsModal(
            "Your account details",
            payload.accounts,
            (account) => {
                $('#dapi-auth').addClass('text-success').html('<i class="fa fa-check"></i> Authentication Done');
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
            console.log("Error");
            console.log(err);
        } else {
            console.log("No error");
        }
    },
    onReady: function() {
        $('#dapiOn').removeAttr('disabled');
        $('#dapi-loading').hide();
        // alert('Login is ready')
        // handler.open(); // opens the Connect widget
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
// $('#dapiOff').on('click', () => {
//     window.location.reload();
//     // ba = null;
//     // handler.open();
// })

function getIntervalTransactions(start_date=null, end_date=null){
    if(ba){
        $('#dapi-transaction').html('<span class="spinner-border spinner-border-sm text-info"></span> We are analyzing your transactions').show();
        if(start_date === null && end_date === null){
            end_date = moment();
            start_date = moment().startOf('month').subtract(5, 'months');
        }
        ba.data.getTransactions(accountID, start_date.format('YYYY-MM-DD'), end_date.format('YYYY-MM-DD')).then(transactionsResponse => {
            if(transactionsResponse.status === "done") {
                let transHtml = [];
                console.dir(transactionsResponse.transactions)
                transactionsResponse.transactions.map((item, i) => {
                    transHtml.push({
                        id: (i+1),
                        transaction_date: moment(item.date).format('YYYY-MM-DD HH:mm:ss'),
                        details: item.description+'<br>'+item.details,
                        type: (item.type).toUpperCase(),
                        reference: item.reference,
                        amount: item.amount,
                    });
                })
                console.log(transHtml)
            } else {
                console.error("API Responded with an error")
                console.dir(transactionsResponse)
            }
            $('#dapi-transaction').addClass('text-success').html('<i class="fa fa-check"></i>Transactions Analysis Done');
        })
        .catch(error => {
            console.dir(error)
            $('#dapi-transaction').html('<i class="fa fa-exclamation-circle"></i>Transactions Analysis Failed');
        })
    }else{
        alert('First login in to your bank account')
    }
}
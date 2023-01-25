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
        $('#dapiOn').hide();
        ba = bankAccount;
        console.log(ba)
        // To get acoutn details
        ba.data.getAccounts().then(payload => {
            ba.showAccountsModal(
            "Your account details",
            payload.accounts,
            (account) => {
                $('#ClientLogged').show();
                accountID = account.id;
                console.dir(account)
            },
            () => {
                console.dir("User Cancelled")
            })
        })
        // getIntervalTransactions();
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
        alert('Login is ready')
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
$('#dapiOff').on('click', () => {
    window.location.reload();
    // ba = null;
    // handler.open();
})

function getIntervalTransactions(start_date=null, end_date=null){
    if(ba){
        if(start_date === null && end_date === null){
            end_date = moment();
            start_date = moment().startOf('month').subtract(5, 'months');
        }
        console.log(start_date.format('YYYY-MM-DD'), end_date)
        ba.data.getTransactions(accountID, start_date.format('YYYY-MM-DD'), end_date.format('YYYY-MM-DD')).then(transactionsResponse => {
            if(transactionsResponse.status === "done") {
                let transHtml = '';
                console.dir(transactionsResponse.transactions)
                transactionsResponse.transactions.map((item, i) => {
                    transHtml += '<tr>\
                            <td>'+(i+1)+'</td>\
                            <td>'+moment(item.date).format('DD-MM-YYYY hh:mm a')+'</td>\
                            <td>'+item.description+'<br>'+item.details+'</td>\
                            <td>'+item.reference+'</td>\
                            <td>'+(item.type).toUpperCase()+'</td>\
                            <td>'+Number(item.amount).toLocaleString('en-AE', {style: 'currency', currency: item.currency.code})+'</td>\
                            </tr>'
                })
                $('#transData').html(transHtml);
            } else {
                console.error("API Responded with an error")
                console.dir(transactionsResponse)
            }
        })
        .catch(error => {
            console.dir(error)
        })
    }else{
        alert('First login in to your Dapi account')
    }
}
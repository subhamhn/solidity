// Import the page's CSS. Webpack will know what to do with it.
// import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import Test_artifacts from '../../build/contracts/High_low.json'

// Test is our usable abstraction, which we'll use through the code below.
var Test= contract(Test_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var bet_address = [];
var total_games;



window.App = {
  start: function() {
    var self = this;

    // Bootstrap the Test abstraction for Use.
    Test.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.basicfunctions();
    });
  },

  
  basicfunctions : function(){
    $("#account").val(account)
    
    web3.eth.getBalance(account, (err, balance) => {
      balance = web3.fromWei(balance, "ether") + ""
      $("#balance").val(balance.trim())
    });
  },

  broker : function(){
    
    var self = this;
    var meta;
    Test.deployed().then(function(instance) {
      meta = instance;
      return meta.check_broker({from: account});
    }).then(function(result) {
      self.basicfunctions();
      console.log(result)
      if(result){
        alert("Broker_page");
        $("#result").html('');
        $("#mine_stack").html('');
        $("#bet_list").html('');

        $("#result").html('<label for="sname">Stock Name : </label>&nbsp;&nbsp;<input type="text" id="sname" /><br>\
        <label for="sprice">Strike Price  : </label>&nbsp;&nbsp;<input type="number" id="sprice" /><br>\
        <label for="etime">Expiry Time : </label>&nbsp;&nbsp;<input type="text" name="daterange" id="edate" /><br>\
        <button onclick="App.broker_bet_add();">Add Bet</button>');

        $("#mine_stack").html('<label for="stake_amount">Stake Amount  </label>&nbsp;&nbsp;<input type="text" id="stake_amount" /><br>\
        <button onclick="App.add_broker_stake();">Add Stake</button><br>\<button onclick="App.de_register();">De-register</button><br><br>\
        <input type="text" id="brokerstakeamount" /><button onclick="App.broker_withdraw()">withdraw</button>');
        $("#bet_list").html('<table class="table table-striped"><thead><tr><th>Game Id</th><th>Stock Name</th><th>Stock Price</th><th>Expiry Time</th><th>Total Bets</th><th>Total Bet Amount</th></tr></thead><tbody id="body_bet"></tbody></table>');
        
        $('input[name="daterange"]').daterangepicker({
          "singleDatePicker": true,
          "timePicker": true,
          "timePickerSeconds": true,
          "timePickerMinutes":true, 
          locale: {
            format: 'MM/DD/YYYY H:mm:ss'
          }
        });
      
   
        Test.deployed().then(function(instance) {
          meta = instance;
          meta.length_of_broker_addresses().then(function(res,err){
            for (var i=0;i<res.toNumber();i++){
              meta.get_broker_address(i).then(function(re,er){
                meta.game_number(re).then(function(ress,errr){
                  for (var i=0;i<ress.toNumber();i++){
                    meta.game_set_map(re,i).then(function(fi,ers){
                      meta.gamers_map(fi[0]).then(function(f,e){
                        meta.total_bet_amount(fi[0]).then(function(t,es){                        
                        $("#body_bet").append('<tr><td>'+fi[0]+'</td><td>'+fi[1]+'</td><td>'+fi[2]/100+'</td><td>'+new Date(fi[3].toNumber()*1000).toLocaleString()+'</td><td>'+f+'</td><td>'+web3.fromWei(t, 'ether')+'</td></tr>')
                      });
                    });
                  });
                  }
                });
              });
            }
          });
        });
        self.bet_list();
        self.viewStack();

      }
      else{
        alert("New Broker_page");
        $("#result").html('<label for="Benter">Enter Amount </label>&nbsp;&nbsp;<input type="text" id="Benter" /><button onclick="App.broker_reg();">Register</button>')
      }
      
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });

  },

  broker_reg : function(){
    var amo = parseInt($("#Benter").val());
    var self = this;
    var meta;
    Test.deployed().then(function(instance) {
      meta = instance;
      return meta.add_broker({from: account,gas: 6000000,value:web3.toWei(amo, 'ether')});
    }).then(function(result) {
      
      self.broker();
      location.reload();
      alert("Success !!!");
    });

  },

  getUnixTime :function()
  {
    var etime = parseInt($("#edate").val());
    var b =((new Date(etime)).getTime())/ 1000;
    return seconds;
  },
  
  /*getUnixTime :function(){
    //var etime = parseInt($("#etime").val());
    var edate = parseInt($("#edate").val());
    //Test.deployed().then((function(instance) {
      //meta = instance;
      return this.getTime()/1000|0 
  },
  var ts = "2016-02-21T02:14:39.000000";
var unix_seconds = ((new Date(ts)).getTime()) /1000;
console.log(unix_seconds);
*/

  broker_bet_add : function(){
    var sname = $("#sname").val();
    var stprice =$("#sprice").val();
    var sprice=(stprice*100);
    console.log(sprice);
    var etime = $("#edate").val();

    etime = parseInt(Math.round(new Date(etime))/1000.0);
    console.log(etime);
    
    // if (etime < 10000000000)
    // etime *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    // var epoch = etime + (new Date().getTimezoneOffset() * -1); //for timeZone   
    // alert(epoch);
    var self = this;
    var meta;
    Test.deployed().then(function(instance) {
      meta = instance;
      return meta.broker_set_game(sname,sprice,etime,{from: account,gas: 6000000});
    }).then(function(result) {
      self.broker();
      alert("Success !!!");
      
      
    });

  },

   
  bet_list: function(){
    $("#body_bet").html('');
    var self = this;
    var meta;
    Test.deployed().then(function(instance) {
      meta = instance;
      return meta.game_number(account);
    }).then(function(result) {
      var bet_count = result.toNumber();
      var bet_obj={};
      for (var i=0;i<bet_count;i++){
          self.bet_items(i);
          self.trader_bet_items(i);
      }
      return bet_obj;
    });
  },




  bet_items : function(i){

    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;
      return meta.game_set_map(account,parseInt(i));
    }).then(function(result) {
     });
  },

  trader_bet_items : function(i){

    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;
      return meta.game_set_map(account,parseInt(i));
    }).then(function(result) {
     });
  },

  add_broker_stake : function(){

    var stake_amount=parseInt($("#stake_amount").val());

    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;
      return meta.add_broker_stake({from: account,gas: 6000000,value:web3.toWei(stake_amount,'ether')});
    }).then(function(result) {
      self.viewStack();
      alert("Success !!!");
    });
  },

  viewStack : function(){
    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;
      return meta.view_stake({from:account});
    }).then(function(result) {
      console.log(result)
     // <label for="tkn">No.of.Tokens :<input class="form-control" id="stack_amt" value="45" readonly /></label>
      $("#b_stack").html('<label for="stack_amt">Your Stake Amount :<input class="form-control" id="stack_amt" value='+web3.fromWei(result.toNumber(),'ether')+' readonly /></label>');

     
    });
  },
      
  trader : function(){
    //bet_address = [];

    alert("Trader_Page");
    $("#result").html('');
    $("#mine_stack").html('');
    $("#bet_list").html('');
    //$("#b_stack").html('<label for="tkn">No.of.Tokens :<input class="form-control" id="stack_amt" value="45" readonly />');
    $("#result").append('<table class="table table-striped"><thead><tr><th>Game Id</th><th>Stock Name</th><th>Stock Price</th><th>Expiry Time</th><th>Total Bets</th><th>Total Bet Amount</th></tr></thead><tbody id="body_bet"></tbody></table>');
    $("#mine_stack").append('<br><label for="bedid">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Game id: </label>&nbsp;&nbsp;&nbsp;<input type="text" id="bid" /><br>\
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label for="betamt">Bet Amount : </label>&nbsp;&nbsp;&nbsp;<input type="text" id="amt" /><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label for="lblamt">Option :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" name="highlow" value="0">HIGH\<input type="radio" name="highlow" value="1">LOW<br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button onclick="App.bet()">Bet</button>\
    <br><br><label for=" cancel bedid">Game id: </label>&nbsp;&nbsp;&nbsp;<input type="text" id="cbt_id" /><br><br>&nbsp&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;<button onclick="App.cancel_bet()">Withdraw</button><br><br>\<form><input type="text" id="increase_game_id" placeholder="game id"  /><input type="text" id="increase_game_amount" placeholder="Increase amount"  /><button id="increase" onclick="App.increaseValue()" value="Increase Value">+</button><br><br>\<input type="text" placeholder="game id" id="decrease_game_id" /><input type="text" placeholder="Decrease amount" id="decrease_game_id_amount"  /><button  onclick="App.decreaseValue()" value="Increase Value">-</button></form>');
    $("#bet_list").html('<table class="table table-striped"><thead><tr><th>Game Id</th><th>Stock Name</th><th>Stock Price</th><th>Expiry Time</th><th>Option Choosed</th><th>Bet Amount</th></thead><tbody id="traderbody_bet"></tbody></table>');
   
    var res_obj = {};
    var self = this;
    // self.get_bet_trader();
    var meta;
    Test.deployed().then(function(instance) {
      meta = instance;
      meta.length_of_broker_addresses().then(function(res,err){ 
        for (var i=0;i<res.toNumber();i++){
          meta.get_broker_address(i).then(function(re,er){
            meta.game_number(re).then(function(ress,errr){
              for (var i=0;i<ress.toNumber();i++){
                meta.game_set_map(re,i).then(function(fi,ers){
                  meta.gamers_map(fi[0]).then(function(f,e){
                    meta.total_bet_amount(fi[0]).then(function(t,es){                        
                      $("#body_bet").append('<tr><td>'+fi[0]+'</td><td>'+fi[1]+'</td><td>'+fi[2]/100+'</td><td>'+new Date(fi[3].toNumber()*1000).toLocaleString()+'</td><td>'+f+'</td><td>'+web3.fromWei(t, 'ether')+'</td></tr>')
                    });
                });
              });
              }
            });
          });
        }
      });
    });
    self.tradersbet();
    
  },

  tradersbet : function(){
    var res_obj = {};
    var self = this;
    var meta;
    Test.deployed().then(function(instance) {
      meta = instance;
      meta.length_of_trader_betted_games({from: account}).then(function(res,err){
        for (var i=0;i<res.toNumber();i++){
          meta.trader_betted_games(account,i).then(function(re,er){
            console.log(re.toNumber())
            meta.struct_index_of_bet_of_trader(account,re.toNumber()).then(function(f,e){
                meta.game_id_map_broker(re.toNumber()).then(function(fsfs,erer){
                  meta.struct_index_of_bet_of_broker(fsfs,re.toNumber()).then(function(final,error){
                    meta.game_set_map(fsfs,final).then(function(finale,errors){
                      meta.game_id_map_trader(re,f).then(function(result,fault){
                        
                       /* meta.is_result_published(re).then(function(rest,fa){
                          console.log(rest);
                        });
                        */
                       
        
                     if(!result[2]){
                            $("#traderbody_bet").append('<tr><td>'+finale[0]+'</td><td>'+finale[1]+'</td><td>'+finale[2]/100+'</td><td>'+new Date(finale[3].toNumber()*1000).toLocaleString()+'</td><td>High</td><td>'+web3.fromWei(result[0], 'ether')+'</td></tr>')
                     }
                     else{
                      $("#traderbody_bet").append('<tr><td>'+finale[0]+'</td><td>'+finale[1]+'</td><td>'+finale[2]/100+'</td><td>'+new Date(finale[3].toNumber()*1000).toLocaleString()+'</td><td>Low</td><td>'+web3.fromWei(result[0], 'ether')+'</td></tr>')
                     }
                     
            });
          });
        });
      });
       });
      });
        }
        });
      });
  },
  // get_bet_trader : function(){
  //   var self = this;
  //   var meta;
  //   var a = Test.deployed().then(function(instance) {
  //     meta = instance; 
  //     meta.bets_of_traders_map(account).then(function(result,error){
  //       console.log(result)
  //     });
  //   });
  // },
  bet :function()
  {
    var id = parseInt($("#bid").val());
    var bamount = parseInt($("#amt").val());
    var option=parseInt($('input[name=highlow]:checked').val());
    console.log(id);
    console.log(bamount);
    console.log(option);
   
    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;    
     // return meta.valid_trader(account);
    //}).then(function(result) {
      return meta.betting(id,option,{from:account,value:web3.toWei(bamount,'ether'),gas:600000});
      }).then(function(result){
      alert("Success ...");
    });
  },
    
  admin : function (){
    var self = this;
    var meta;
    Test.deployed().then(function(instance) {
      meta = instance;
      return meta.check_admin({from:account});
    }).then(function(result) {
      if(result)
     {
       alert("Yes!... You are a admin");
    $("#result").html('');
    $("#mine_stack").html('');
    $("#bet_list").html('');
    //$("#b_stack").html('<label for="conblnc">Contract Balance :<input class="form-control" id="cb" value="150" readonly />');
    $("#result").append('<table class="table table-striped"><thead><tr><th>Game Id</th><th>Stock Name</th><th>Stock Price</th><th>Expiry Time</th><th>Total Bets</th><th>Total Bet Amount</th></tr></thead><tbody id="body_bet"></tbody></table>');
    $("#mine_stack").append('<br><input type="text" placeholder="Game ID" name="ids" id="game_id" /><br>\<input type="radio" name="highlow" value="0">HIGH\<input type="radio" name="highlow" value="1">LOW\<input type="radio" name="highlow" value="2">DRAW<br>\<button onclick="App.final()">FINALIZE</button>');
    var res_obj = {};
    
        
    Test.deployed().then(function(instance) {
      meta = instance;
      meta.length_of_broker_addresses().then(function(res,err){
        for (var i=0;i<res.toNumber();i++){
          meta.get_broker_address(i).then(function(re,er){
            meta.game_number(re).then(function(ress,errr){
              for (var i=0;i<ress.toNumber();i++){
                meta.game_set_map(re,i).then(function(fi,ers){
                  meta.gamers_map(fi[0]).then(function(f,e){
                    meta.total_bet_amount(fi[0]).then(function(t,es){                        
                      $("#body_bet").append('<tr><td>'+fi[0]+'</td><td>'+fi[1]+'</td><td>'+fi[2]/100+'</td><td>'+new Date(fi[3].toNumber()*1000).toLocaleString()+'</td><td>'+f+'</td><td>'+web3.fromWei(t, 'ether')+'</td></tr>')
                    });
                });
              });
              }
            });
          });
        }
      });
    });

  }
  else
  {
    alert("NO!.. You did not have access ");
  }  
  });
  },
  
  /*tokens:function(){
  alert("You Could see Available Tokens");
    $("#b_stack").html('');
    $("#result").html('');
    $("#mine_stack").html('');
    $("#result").append('<table class="table table-striped"><thead><tr><th>Token Name</th><th>Token Symbol</th><th>Token price</th><th>Tokens in Stock</th></tr></thead><tbody id="body_bet"></tbody></table>');
    $("#mine_stack").append('<br><input type="text" placeholder="Enter no.of tokens" name="tk" id="nooftkn" />&nbsp;<button onclick="App.buy()">Buy</button>');
  },*/

  buy:function(){
    var num= parseInt($("#nooftkn").val());
    alert(num);
    alert("Purchased");
    var self = this;
    var meta;
    Test.deployed().then(function(instance){
      meta = instance;
      var tot=num*10;
      alert(tot);
      return meta.buy_tokens({from:account,value:web3.toWei(num,'ether'),gas:600000});
    }).then(function(result){

  });

  },

  final:function(){
 
  var gameid = parseInt($("#game_id").val());
  var resoption = parseInt($('input[name=highlow]:checked').val()); 
  console.log("game id",gameid);
  console.log("result chosed",resoption);
  var self = this;
  var meta;
  
  Test.deployed().then(function(instance){
    meta = instance;
  
    return meta.admin_setting_result_and_distribute_money(gameid,resoption,{from: account,gas: 6000000});
  }).then(function(result){   
    console.log(result);
  });
  
  },
        
  betting_check:function(){
    var game_id = parseInt($("#game_id").val());
    var input_amount = parseInt($("#input_amount").val());
    
    var self = this;
    var meta;
    var a=Test.deployed().then(function(instance){
        meta = instance;
        return meta.betting_check(game_id,input_amount,{from: account,value:stake_amount,gas: 6000000});
    }).then(function(result) {
      self.viewStack();
      alert("Success !!!");
  });
},
trader_check : function(){
  var self = this;
  var meta;
  var a =Testt.depolyed().then(function(instance){
    meta = instance;
    return meta.check_trader({from: account});
  }).then(function(result){
        self.valid_trader();
  });
},
valid_trader: function(){
  $("#body_bet").html('');
  var self = this;
  var meta;
  Test.deployed().then(function(instance){
    meta = instance;
    return meta.valid_trader(account);
  }).then(function(result){
    self.trader();
  });
},
 
betting : function(){
  var game_id = parseInt($("#game_id").val());
  var input_amount = parseInt($("#input_amount").val());
  var option =  parseInt($("#option").val());
  var self = this;
  var meta;
  var a=Test.deployed().then(function(instance){
    meta = instance;
    return meta.betting(game_id,option,{from: account,gas: 6000000,value:web3.toWei(input_amount, 'ether')});
  }).then (function(result){
    self.trader();
  });
},
result:function(){
var game_id = parseInt($("#game_id").val());
var option =  parseInt($("#option").val());
var self = this;
var meta;
var a = Test.depolyed().then(function(instance){
  meta = instance;
  return meta.admin_setting_result_and_distribute_money(game_id,option,{from: account,gas: 6000000,value:web3.toWei(amo, 'ether')});
}).then(function(result){
});
},
increaseValue: function(){
  var game_id = parseInt($("#increase_game_id").val());
   var input_amount = parseInt($("#increase_game_amount").val());
  var meta
  var a =Test.deployed().then(function(instance){
    meta = instance;
    return meta.trader_increase_bet_amount(game_id,{from: account,value:web3.toWei(input_amount,'ether'),gas: 6000000});
  }).then(function(result){
      self.trader();
      self.viewStack();
  });
},
decreaseValue: function(){
  var game_id = parseInt($("#decrease_game_id").val());
  var input_amount = parseInt($("#decrease_game_id_amount").val());
  input_amount=web3.toWei(input_amount);
  console.log(input_amount);
  var meta
  var a =Test.deployed().then(function(instance){
    meta = instance;
    return meta.trader_decrease_bet_amount(game_id,input_amount,{from: account,gas: 6000000});
  }).then(function(result){
    console.log(result);
      self.trader();
      self.viewStack();
  });
},
cancel_bet : function(){
  var game_id = parseInt($("#cbit_id").val());
  var meta;
  var a = Test.deployed().then(function(instance){
    meta = instance;
    return meta.trader_cancel_bet_and_widthdraw(game_id,{from: account,gas: 6000000});
  }).then(function(result){
    self.trader();
    self.viewStack();
  });
},
de_register: function(){
  var self = this;
  var meta;
  var a = Test.deployed().then(function(instance){
    meta = instance;
    return meta.broker_de_registration({from: account,gas: 6000000});
  }).then(function(result){
      self.viewStack();
      alert("broker de_registered");
  });
},
broker_withdraw:function(){
  var input_amount = parseInt($("#brokerstakeamount").val());
  console.log(input_amount);
  var self = this;
  var meta;
  var a =Test.deployed().then(function(instance){
    meta = instance;
    return meta.broker_withdraw_amount_from_stake(web3.toWei(input_amount,'ether'),{from: account,gas: 6000000});
  }).then(function(result){
    self.viewStack(); 
  });
}
/* getresult : function(){
    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;
      return meta.admin_setting_result_and_distribute_money(gameid,option);
    }).then(function(result) {
    });
  },
  trader_bet_increase: function(){
    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;
      return meta.trader_increase_bet_amount(gameid,amount);
    }).then(function(result) {
    });
  },
  trader_bet_cancel: function(){
    var self = this;
    var meta;
    var a = Test.deployed().then(function(instance) {
      meta = instance;
      return meta.trader_cancel_bet_and_widthdraw(gameid);
    }).then(function(result) {
    });
  },
  de_register :function(){  
  var self = this;
  var meta;
  var a = Test.deployed().then(function(instance) {
    meta = instance;
    return meta.broker_de_registration();
  }).then(function(result) {
  });
},
de_register :function(){  
  var self = this;
  var meta;
  var a = Test.deployed().then(function(instance) {
    meta = instance;
    return meta.broker_withdraw_amount_from_stack(input_amount);
  }).then(function(result) {
  });
},*/
};
  
window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 Test, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();

});
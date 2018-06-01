pragma solidity ^0.4.0;

import "./Loan_token.sol";


contract Loan{
    
    address admin;
    uint256 rate;
    Loan_token token;
    uint256 public amo;                                                                                                                                                                                
    struct borrower
    {
        uint256 amount;
    }
    mapping(address=>borrower)public br;
    
    function Loan(Loan_token _token)public
    {
       admin = msg.sender;
       token = _token;
       
    }
    
    struct FI
    {
        string name;
        uint256 amount;
        uint256 months;
        uint256 interest;
    }   
    struct get_loan
    {
        uint256 tokens;
    }
    mapping(address=>get_loan)public req_loan;
    mapping (address=>FI) public Reg;
    
    address[] Reg_FI;
    
    function Reg(string _name, uint256 _interest, uint256 _months)public payable returns(bool)
    {
        Reg[msg.sender].name = _name;
        Reg[msg.sender].interest = _interest;
        Reg[msg.sender].months = _months;
        Reg[msg.sender].amount = msg.value;
        Reg_FI.push(msg.sender);
        return true;
    }
    function check() public view returns (uint256)
    {
        return this.balance;
    }
    
    function Show_FI() public view returns(address[])
    {
        return Reg_FI;
    }
    
    function buy_token()public payable returns(bool)
    {
        Loan_token(token).transferFrom(token, msg.sender, msg.value*1000);
        return true;
    }
    
    function account_token_balance() public constant returns(uint256)
    {
        return Loan_token(token).balanceOf(msg.sender);
    }
    
    function borrower_Loan(uint256 amo_of_token,address _to)public payable returns(bool)
    {
        require(amo_of_token>0);
        req_loan[msg.sender].tokens=amo_of_token;
        Loan_token(token).transferFrom(msg.sender,_to,amo_of_token); 
        Reg[_to].amount -= ((amo_of_token * 1 ether)*80/100);
        msg.sender.transfer(((amo_of_token * 1 ether)*80/100));
    }
    function payment(address _to)public payable returns(bool)
    {
       //Loan_token(token).transferFrom();             
    }
    
   
}

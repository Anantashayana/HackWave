pragma solidity ^0.8.0;

contract userId {
    string public user1;
    string public user2;

    function storeData(string memory _user1, string memory _user2) public {
        user1 = _user1;
        user2 = _user2;
    }
}

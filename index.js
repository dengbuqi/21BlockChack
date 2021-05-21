// Websocket server
const http = require("http");
const express = require("express");
const { client } = require("websocket");
const { join } = require("path");
const app = express();
const server = require("http").createServer(app);
const PORT = process.env.PORT || 3000;
const WebSocket = require("ws")
const Web3 = require('web3');
const wss = new WebSocket.Server({ server:server });
const fs = require("fs");
const roundIdLog = fs.createWriteStream('roundIdLog.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
});

let web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
const privateKey = 'd87598439afbdde42ccbbfe83ef0b26027ddeb3b2e5705bcca40f2e817025cc4';
const contractAddress = '0x1e1D7d65568e3Ef99ae8b0A3bd2969273e525A22'
const ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "charityAddr",
				"type": "address"
			}
		],
		"name": "addCharityAddr",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyChips",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "chipsToDonate",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "charityAddr",
				"type": "address"
			}
		],
		"name": "donateChips",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameID",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "cardValue",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "suit",
				"type": "uint8"
			}
		],
		"name": "eNewCard",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameID",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "cardValue",
				"type": "uint8"
			},
			{
				"internalType": "enum TOBJ.CardSuit",
				"name": "suit",
				"type": "uint8"
			}
		],
		"name": "giveNewCard",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameID",
				"type": "uint256"
			}
		],
		"name": "markGamePayed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameID",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "newBalance",
				"type": "uint256"
			}
		],
		"name": "setBalance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "transferChips",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "Games",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "gameID",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pot",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "playerTurn",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "payed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameID",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPlayerHand",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint8",
						"name": "value",
						"type": "uint8"
					},
					{
						"internalType": "enum TOBJ.CardSuit",
						"name": "suit",
						"type": "uint8"
					}
				],
				"internalType": "struct TOBJ.Card[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "playerBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

acc = web3.eth.accounts.privateKeyToAccount(privateKey);
let SmartContract = new web3.eth.Contract(ABI, contractAddress);
const TransectionOBJ = {
  from: acc.address,
}
const suits = {
  "Club": 0,
  "Diamond": 1,
  "Heart": 2,
  "Spade": 3,
}

const cards = {
  "A": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
}
// update the cards log to Eth blockchain
function updateNewCard(roundId, addr, card, suit) {
  // console.log("updateNewCard");
  // console.log(roundId, addr, cards[card], suits[suit]);
  SmartContract.methods.giveNewCard(roundId, addr, cards[card], suits[suit])
  .send(TransectionOBJ)
  .then((e) =>{
    // console.log(e);
  });
}

function setroundBalance(roundId, players) {
  // console.log("setroundBalance");
  // console.log();
  for(let i = 0; i < players.length; i++){
    SmartContract.methods.setBalance(players[i].nickname, players[i].balance)
    .send(TransectionOBJ)
    .then((e) =>{
      // console.log(e);
    });
  }
}

function setroundPayed(roundId){
  // console.log("setroundBalance", roundId);
  SmartContract.methods.markGamePayed(roundId)
  .send(TransectionOBJ)
  .then((e) =>{
    // console.log(e);
  });
}



// Serve all the static files, (ex. index.html app.js style.css)
app.use(express.static("public/"));
// Before 8081
server.listen(PORT, () =>
  console.log(`Listening on ${process.env.PORT} or 3000`)
);

// hashmap clients
const clients = {};
const games = {};
const players = {};
const spectators = {};
const playerSlotHTML = {};

let dealer = null;
let gameOn = null;
let player = null;

wss.on("connection", (ws) => { // wsServer || wss AND request || connection
  console.log("FIRE")
  // Someone trying to connect
  // const connection = connection.accept(null, connection.origin);
  ws.on("open", () => console.log("opened")); // connection || wss
  ws.on("close", () => { // connection || wss
    console.log("closed");
  });


  //################ What we need to upload to blockchain ######################//
  /*
      deck
      updatePlayerCards
      updateDealerCards
      resetGameState
  */
  //################ What we need to upload to blockchain ######################//
  ws.on("message", (message) => { // connection || wss
    const result = JSON.parse(message);
    // console.log(result.method);

    // a user want to create a new game
    if (result.method === "create") {
      // console.log("create")
      const clientId = result.clientId;
      const theClient = result.theClient;
      const playerSlot = result.playerSlot;
      const playerSlotHTML = result.playerSlotHTML;
      const offline = result.offline;
      const roomId = partyId();
      const gameId = `http://localhost:3000/` + roomId;

      app.get("/" + roomId, (req, res) => {
        res.sendFile(__dirname + "/public/index.html");
      });

      // .route.path
      games[gameId] = {
        id: gameId,
        clients: [],
        players: [],
        dealer: dealer,
        gameOn: gameOn,
        roundId: null, // each round's ID
        roundState: null, // for each round, each status' ID. 
        player: player,
        spectators: [],
        // "lobbySpectators": [],
        playerSlot: playerSlot,
        playerSlotHTML: [
          // 7 objectes because the playerSlot has a length of 7
          {},
          {},
          {},
          {},
          {},
          {},
          {},
        ],
        deck: null,
      };

      const payLoad = {
        method: "create",
        game: games[gameId],
        roomId: roomId,
        offline: offline,
      };

      const con = clients[clientId].ws;
      con.send(JSON.stringify(payLoad));
    }

    // a client want to join
    if (result.method === "join") {
      const nickname = result.nickname;
      const avatar = result.avatar;
      const gameId = result.gameId;
      const roomId = result.roomId;
      let theClient = result.theClient;
      const clientId = result.clientId;
      // const gameId = result.gameId;
      const game = games[gameId];
      let players = game.players;
      const spectators = game.spectators;
      const playerSlot = game.playerSlot;
      const playerSlotHTML = game.playerSlotHTML;
      // const partyId = result.partyId;

      theClient.nickname = nickname;
      theClient.avatar = avatar;
      
      // check balance
      SmartContract.methods.playerBalance(theClient.nickname)
      .call(function(error, result){
      if(error === null){
        theClient.balance = result;
      }else{
        theClient.balance = 0;
      }
      console.log(error);
      if (game.spectators.length >= 7) {
        // Max players reached
        return;
      }

      // Push unique Id to the client
      theClient.clientId = clientId;
      // Push client to players array
      // game.players.push(theClient)
      game.spectators.push(theClient);

      // Assign theClient to game.spectators[i]
      for (let i = 0; i < game.spectators.length; i++) {
        if (game.spectators[i].clientId === clientId) {
          // theClient = game.spectators[i]
          game.spectators[i] = theClient;
        }
      }

      const payLoad = {
        method: "join",
        game: game,
        players: players,
        spectators: spectators,
        playerSlotHTML: playerSlotHTML,
        roomId: roomId,
      };

      // loop through all clients and tell them that people has joined
      // if(game.players.length === 0) {
      if (!game.gameOn === true) {
        game.spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }

      // }

      const payLoadClient = {
        method: "joinClient",
        theClient: theClient,
        // "players": players,
        // "spectators": spectators,
        // "playerSlotHTML": playerSlotHTML,
        game: game,
        // "gameOn": gameOn
      };
      // Send theClient to THE CLIENT
      if (!game.gameOn === true) {
        clients[clientId].ws.send(JSON.stringify(payLoadClient));
      }

      const newPlayer = theClient;
      // Important to send this payLoad last, because it needs to know the the clientId
      const payLoadClientArray = {
        method: "updateClientArray",
        players: players,
        newPlayer: newPlayer,
        spectators: spectators,
        playerSlot: playerSlot,
        playerSlotHTML: playerSlotHTML,
      };

      // if(game.players.length === 0) {
      if (!game.gameOn === true) {
        game.spectators.forEach((c) => {
          clients[c.clientId].ws.send(
            JSON.stringify(payLoadClientArray)
          );
        });
      }
      // }

      // If a player joins mid-game
      const payLoadMidGame = {
        method: "joinMidGame",
        theClient: theClient,
        game: game,
      };

      if (game.gameOn === true) {
        clients[clientId].ws.send(JSON.stringify(payLoadMidGame));
      }

      // Send this to ALL clients, to let them know that a new spectator joined
      const payLoadMidGameUpdate = {
        method: "joinMidGameUpdate",
        spectators: spectators,
        newPlayer: newPlayer,
      };
      if (game.gameOn === true) {
        game.spectators.forEach((c) => {
          clients[c.clientId].ws.send(
            JSON.stringify(payLoadMidGameUpdate)
          );
        });
      }
        
      });


    }

    if (result.method === "terminateRoom") {
      // let roomId = result.roomId
      // // console.log(app._router.stack[3].route.path)
      // for(let i = 3; i < app._router.stack.length; i++) {
      //   // console.log(app._router.stack[i])
      //   console.log(app._router.stack[i].route.path)
      //   console.log("/" + roomId)
      //   if(app._router.stack[i].route.path === "/" + roomId) {
      //     console.log(app._router.stack[i].route.path)
      //     app._router.stack.splice(i,1);
      //   }
      // }
    }

    // bets
    if (result.method === "bet") {
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "bet",
        players: players,
        // "spectators": spectators
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "deck") {
      const players = result.players;
      const spectators = result.spectators;
      const gameId = result.gameId;
      const game = games[gameId];
      const deck = result.deck;
      const clientDeal = result.clientDeal;
      const gameOn = result.gameOn;
      const payLoad = {
        method: "deck",
        players: players,
        dealer: dealer,
        deck: deck,
        gameOn: gameOn,
        clientDeal: clientDeal,
      };
      game.roundId = roundId();
      game.roundState = result.method;
      game.deck = deck;
      game.players = players;
      game.dealer = dealer;
      console.log("round:", game.roundId, "start!");
      setroundBalance(game.roundId, players);
      roundIdLog.write(game.roundId+",\n");
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "isReady") {
      const theClient = result.theClient;
      const playerBet = theClient;
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "isReady",
        players: players,
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "hasLeft") {
      const theClient = result.theClient;
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "hasLeft",
        players: players,
        spectators: spectators,
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "currentPlayer") {
      const players = result.players;
      const player = result.player;
      const dealersTurn = result.dealersTurn;
      const spectators = result.spectators;

      const payLoad = {
        method: "currentPlayer",
        player: player,
      };

      if (dealersTurn === false) {
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }

      if (dealersTurn === true) {
        players.pop(players.slice(-1)[0]);
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }
    }

    if (result.method === "update") {
      const players = result.players;
      const dealer = result.dealer;
      const deck = result.deck;
      const spectators = result.spectators;
      const gameId = result.gameId;
      const game = games[gameId];
      // const gamebefore = JSON.parse(JSON.stringify(game));
      const gameOn = result.gameOn;
      const dealersTurn = result.dealersTurn;

      const payLoad = {
        method: "update",
        players: players,
        dealer: dealer,
        deck: deck,
        gameOn: gameOn,
      };
      game.roundState = result.method;
      game.deck = deck;
      game.players = players;
      game.dealer = dealer;
      game.deck = deck;
      
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "thePlay") {
      const players = result.players;
      const gameId = result.gameId;
      const game = games[gameId];
      const player = result.player;
      const dealersTurn = result.dealersTurn;
      const currentPlayer = result.currentPlayer;
      const spectators = result.spectators;

      const payLoad = {
        method: "thePlay",
        player: player,
        currentPlayer: currentPlayer,
        players: player,
        // "theClient": theClient
      };

      // players[currentPlayer].clientId.ws.send(JSON.stringify(payLoad))
      if (dealersTurn === false) {
        game.players.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }
    }

    if (result.method === "showSum") {
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "showSum",
        players: players,
      };
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "joinTable") {
      let theClient = result.theClient;
      const user = result.theClient;
      const theSlot = result.theSlot;
      const gameId = result.gameId;
      const game = games[gameId];
      const spectators = result.spectators;
      const players = result.players;
      const playerSlotHTML = result.playerSlotHTML;

      // Update all palyerSlots
      // for(let i = 0; i < playerSlot.length; i++) {
      //   if(playerSlot[i].innerHTML === clientId) {
      //     playerSlotHMTL
      //   }
      // }

      // Push client to players array
      players.push(theClient);
      // Push client Id to playerSlotHTML array
      playerSlotHTML[theSlot] = clientId;

      // Assign theClient to game.players[i]
      for (let i = 0; i < players.length; i++) {
        if (players[i].clientId === clientId) {
          // theClient = game.players[i]
          players[i] = theClient;
        }
      }

      game.players = players;
      game.playerSlotHTML = playerSlotHTML;

      const payLoad = {
        method: "joinTable",
        theSlot: theSlot,
        user: user,
        game: game,
        players: players,
        spectators: spectators,
        playerSlotHTML: playerSlotHTML,
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });

      // Send this to the client who pressed join
      const payLoadClient = {
        method: "joinTableClient",
      };
    }

    if (result.method === "updateTable") {
      const playerSlot = result.playerSlot;

      // const payLoad = {
      //   "method": "joinTable",
      //   "theSlot": theSlot,
      //   "user": user,
      //   "game": game,
      //   "players": players,
      //   "spectators": spectators
      // }

      // spectators.forEach(c => {
      //   clients[c.clientId].ws.send(JSON.stringify(payLoad))
      // })
    }

    if (result.method === "updatePlayerCards") {
      const resetCards = result.resetCards;
      const players = result.players;
      const player = result.player;
      const spectators = result.spectators;
      const gameId = result.gameId;
      const game = games[gameId];
      const payLoad = {
        method: "updatePlayerCards",
        players: players,
        player: player,
        resetCards: resetCards,
      };

      for(let i = 0; i < players.length; i++){
        if(players[i].cards.length != game["players"][i].cards.length){
          updateNewCard(game.roundId, players[i].nickname,
          players[i].cards[players[i].cards.length-1].value.card,
          players[i].cards[players[i].cards.length-1].suit);
        }
      }
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "updateDealerCards") {
      const players = result.players;
      const spectators = result.spectators;
      const player = result.player;
      const dealer = result.dealer;
      const dealersTurn = result.dealersTurn;
      const gameId = result.gameId;
      const game = games[gameId];
      // const dealerHiddenCardRemoveNext = result.dealerHiddenCardRemoveNext
      const payLoad = {
        method: "updateDealerCards",
        player: player,
        dealer: dealer,
        players: players,
        dealersTurn: dealersTurn,
        // "dealerHiddenCardRemoveNext": dealerHiddenCardRemoveNext
      };
      if (dealer.cards.length != game.dealer.cards.length){
        updateNewCard(game.roundId, acc.address, 
        dealer.cards[dealer.cards.length-1].value.card,
        dealer.cards[dealer.cards.length-1].suit);
      }


      if (dealersTurn === false) {
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }

      if (dealersTurn === true) {
        players.pop(players.slice(-1)[0]);
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }

      
    }

    if (result.method === "dealersTurn") {
      const players = result.players;
      const dealersTurn = result.dealersTurn;
      const spectators = result.spectators;
      const payLoad = {
        method: "dealersTurn",
        dealersTurn: dealersTurn,
      };
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "terminate") {
      let gameId = result.gameId;
      let game = games[gameId];
      // let game = result.game
      let spectators = result.spectators;
      let players = result.players;
      const theClient = result.theClient;
      let playerSlotHTML = result.playerSlotHTML;
      const reload = result.reload;
      const gameOn = result.gameOn;
      const player = result.player;
      const clientDeal = result.clientDeal;
      const playersCanPlay = result.playersCanPlay;

      const oldPlayerIndex = spectators.findIndex(
        (spectators) => spectators.clientId === theClient.clientId
      );

      // Remove players from player array if the client with the dealscript leaves during 2 card deal phase
      // if(playersCanPlay === false && clientDeal === theClient.clientId) {
      //   players = [];
      // }

      // To prevent error when user disconnects outside a game
      if (game === undefined) {
        game = {
          spectators: {},
          players: {},
          playerSlotHTML: {},
        };
      }

      // Get what index the player is in so we can later delete him from the table on the client side
      let playerSlotIndex = null;

      // Append hasLeft to the spectators array
      for (let i = 0; i < players.length; i++) {
        for (let s = 0; s < spectators.length; s++) {
          if (players[i].hasLeft === true) {
            if (spectators[s].clientId === players[i].clientId) {
              spectators[s].hasLeft = true;
            }
          }
        }
      }

      // Terminate player from playerSlotHTML
      for (let i = 0; i < playerSlotHTML.length; i++) {
        if (clientId === playerSlotHTML[i]) {
          playerSlotIndex = i;
        }
      }

      // If spectators.length === 1 and dealers is in PLAYERS array, splice dealer in both in PLAYERS array
      if (spectators.length === 1 && players.some((e) => e.hiddenCard)) {
        players.splice(-1)[0];
      }

      if (gameOn === false || spectators.length === 1) {
        // if(spectators.length === 1) gameOn = false;

        // If player reloads page, remove him from spectators array
        if (reload === true) {
          // Terminate player from spectators
          for (let i = 0; i < spectators.length; i++) {
            if (clientId === spectators[i].clientId) {
              spectators.splice(i, 1);
              // spectators.splice(i, 1)
            }
          }
        }

        // Terminate player from playerSlotHTML
        for (let i = 0; i < playerSlotHTML.length; i++) {
          if (clientId === playerSlotHTML[i]) {
            // playerSlotIndex = i;
            playerSlotHTML[i] = {};
          }
        }
        // Terminate player from players array
        for (let i = 0; i < players.length; i++) {
          if (clientId === players[i].clientId) {
            players.splice(i, 1);
            // players.splice(i, 1)
          }
        }
      }

      // else if(gameOn === true && players.length === 1) {
      //   players = []
      // }

      game.spectators = spectators;
      game.players = players;
      game.playerSlotHTML = playerSlotHTML;
      // game.gameOn = gameOn

      const payLoad = {
        method: "leave",
        playerSlotIndex: playerSlotIndex,
        players: players,
        playerSlotHTML: playerSlotHTML,
        spectators: spectators,
        oldPlayerIndex: oldPlayerIndex,
        game: game,
        gameOn: gameOn,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });

      // lobbySpectators.forEach(c => {
      //   clients[c.clientId].ws.send(JSON.stringify(payLoad))
      // });

      // // Send to THE client
      // const con = clients[clientId].ws
      // con.send(JSON.stringify(payLoad));
    }

    if (result.method === "playersLength") {
      const gameId = result.gameId;
      const game = games[gameId];
      const spectators = game.spectators;
      const playersLength = game.spectators.length;

      const payLoadLength = {
        method: "playersLength",
        playersLength: playersLength,
      };

      ws.send(JSON.stringify(payLoadLength));
    }

    if (result.method === "resetRound") {
      const spectators = result.spectators;
      const theClient = result.theClient;

      const payLoad = {
        method: "resetRound",
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "playerResult") {
      const spectators = result.spectators;
      const players = result.players;

      const payLoad = {
        method: "playerResult",
        players: players,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "playerResultNatural") {
      const spectators = result.spectators;
      const players = result.players;
      const playerNaturalIndex = result.playerNaturalIndex;

      const payLoad = {
        method: "playerResultNatural",
        players: players,
        playerNaturalIndex: playerNaturalIndex,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "finalCompare") {
      const spectators = result.spectators;
      const gameId = result.gameId;
      const game = games[gameId];
      const players = result.players;
      game.players = players;

      const payLoad = {
        method: "finalCompare",
        // "players": players
      };
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "resetGameState") {
      const spectators = result.spectators;
      const gameId = result.gameId;
      const game = games[gameId];
      const players = result.players;
      game.players = players;

      const payLoad = {
        method: "resetGameState",
        game: game,
      };
      game.roundState = result.method;
      setroundBalance(game["roundId"], players);
      setroundPayed(game["roundId"]);
      game.roundId = null;
      game.roundState = null;
      game.deck = null;
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "wsDealCards") {
      dealCards();
    }

    if (result.method === "getRoute") {
      const getRouteId = result.getRouteId;
      let isRouteDefined = null;

      for (let i = 3; i < app._router.stack.length; i++) {
        if (app._router.stack[i].route.path === "/" + getRouteId) {
          isRouteDefined = true;
        } else {
          isRouteDefined = false;
        }
      }
      // if route is not available, redirect to home page
      const payLoadRoute = {
        method: "redirect",
        isRouteDefined: isRouteDefined,
      };

      if (isRouteDefined === false) {
        ws.send(JSON.stringify(payLoadRoute));
      }
    }

    if (result.method === "dealersHiddenCard") {
      const spectators = result.spectators;
      const dealersHiddenCard = result.dealersHiddenCard;

      const payLoad = {
        method: "dealersHiddenCard",
        dealersHiddenCard: dealersHiddenCard,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "startTimer") {
      const spectators = result.spectators;

      const payLoad = {
        method: "startTimer",
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "syncGame") {
      const gameId = result.gameId;
      let game = games[gameId];
      // let gamebefore = {};
      // gamebefore.gameOn = false;
      const gameOn = result.gameOn;
      const dealer = result.dealer;
      const players = result.players;
      const player = result.player;
      const spectators = result.spectators;
      const playerSlotHTML = result.playerSlotHTML;
      if (game === undefined) {
        game = {};
      }
      // if (typeof(game.gameOn) != undefined){
      //   gamebefore = JSON.parse(JSON.stringify(game));
      // }

      // Sync players & spectators arrays
      game.gameOn = gameOn;
      game.dealer = dealer;
      game.players = players;
      game.player = player;
      game.spectators = spectators;
      game.playerSlotHTML = playerSlotHTML;

      // // game start
      // if((game.gameOn == true) && (gamebefore.gameOn == false)){
      //   console.log(game.id + ": game start!")
        
      // }

      // //game palying
      // if((game.gameOn == true) && (gamebefore.gameOn == true)){
      //   console.log(game.id + ": game playing!")
      // }

      // //game stop
      // if((game.gameOn == false) && (gamebefore.gameOn == true)){
      //   console.log(game.id + ": game stop!")
      // }

      // //game waiting
      // if((game.gameOn == false) && (gamebefore.gameOn == false)){
      //   console.log(game.id + ": game waiting")
      // }
      // console.log(gamebefore);
      // console.log(game);
      // console.log("################################################################");
    }

  });
  // The ClientId
  const clientId = guid();
  // The Client
  clients[clientId] = {
    ws: ws,
  };

  // The client object
  let theClient = {
    nickname: "",
    avatar: "",
    cards: [],
    bet: 0,
    balance: 0,
    sum: null,
    hasAce: false,
    isReady: false,
    blackjack: false,
    hasLeft: false,
  };
  let player = null;
  // The players Array
  players[theClient] = {
    ws: ws,
  };
  players[player] = {
    ws: ws,
  };
  // The spectator Array
  spectators[theClient] = {
    ws: ws,
  };

  // Send this to client
  const payLoad = {
    method: "connect",
    clientId: clientId,
    theClient: theClient,
  };

  // Send the payLoad to the client
  ws.send(JSON.stringify(payLoad));
});

// Generates unique guid (i.e. unique user ID)
const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
};

// Random Part ID
function partyId() {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Random Round ID
function roundId() {
  var result = "";
  var characters = "0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


// console.log(partyId());

app.get("/offline", (req, res) => {
  res.sendFile(__dirname + "/public/offline.html");
});

app.get("/credits", (req, res) => {
  res.sendFile(__dirname + "/public/credits.html");
});

app.get("/:id", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("*", function (req, res) {
  res.redirect("/");
});

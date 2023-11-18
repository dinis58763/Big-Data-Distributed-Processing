const autocannon = require('autocannon');
const { v4: uuidv4 } = require('uuid');

// Stress Test 1: The client makes the same request very quickly.
function stressTest1() {

    console.log("Stress Test 1 running...")

    const url = 'http://localhost:8080';

    const instance = autocannon({
        url,
        connections: 10,
        duration: 5,
        headers: {
            "content-type": "application/json"
        },
        requests: [
            {
                method: "GET",
                path: "/list",
            }
        ]
    }, (err, result) => {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log("Results:", result);
        }
    });
}


// Stress Test 2: Two or more clients make the possible requests randomly.
function stressTest2() {

    console.log("Stress Test 2 running...")

    const url = 'http://localhost:8080';
    const movies = ["Interstellar", "The Notebook", "Shrek"];
    const clients = [
        { name: "Client1", tickets: 2 },
        { name: "Client2", tickets: 3 },
        { name: "Client3", tickets: 1 }
    ];

    const instance = autocannon({
        url,
        connections: 5,
        duration: 10,
        workers: 2,
        headers: {
            "content-type": "application/json"
        },
        requests: [
            {
                method: "GET",
                path: "/list",
            },
            ...clients.flatMap(client => {
                const clientRequests = [];
                for (let i = 0; i < movies.length; i++) {
                    const movieName = movies[i];
                    const nTickets = Math.min(client.tickets, 8); // Limit the number of tickets per client request to a maximum of 8
                    clientRequests.push({
                        method: "POST",
                        path: "/reservations",
                        body: JSON.stringify({
                            ID: uuidv4(), // Generate a random UUID for each reservation ID
                            movie_name: movieName,
                            person_name: client.name,
                            n_tickets: nTickets
                        })
                    });
                }
                return clientRequests;
            })
        ]
    }, (err, result) => {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log("Results:", result);
        }
    });
}


// Stress Test 3: Immediate occupancy of all seats/reservations on 2 clients.
function stressTest3() {

    console.log("Stress Test 3 running...")

    const url = 'http://localhost:8080';
    const movies = [
        { movie_name: "Interstellar", seats: 200 },
        { movie_name: "The Notebook", seats: 130 },
        { movie_name: "Shrek", seats: 150 }
    ];

    const personNames = ["John Doe", "Jane Smith", "Michael Johnson", "Emily Davis", "David Brown"];

    function getRandomPersonName() {
        const randomIndex = Math.floor(Math.random() * personNames.length);
        return personNames[randomIndex];
    }

    const instance = autocannon({
        url,
        connections: 2,
        duration: 5,
        headers: {
            "content-type": "application/json"
        },
        requests: movies.map(movie => {
            const totalSeats = movie.seats;
            const client1Seats = Math.floor(totalSeats * 0.6); // 60% of the total seats
            const client2Seats = Math.floor((totalSeats - client1Seats) * 0.4); // 40% of the remaining seats
            return [
                {
                    method: "POST",
                    path: "/reservations",
                    body: JSON.stringify({
                        ID: uuidv4(),
                        movie_name: movie.movie_name,
                        person_name: getRandomPersonName(),
                        n_tickets: client1Seats
                    })
                },
                {
                    method: "POST",
                    path: "/reservations",
                    body: JSON.stringify({
                        ID: uuidv4(),
                        movie_name: movie.movie_name,
                        person_name: getRandomPersonName(),
                        n_tickets: client2Seats
                    })
                }
            ];
        }).flat()
    }, (err, result) => {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log("Results:", result);
        }
    });
}


// Stress Test 4: Constant cancellations and seat occupancy (for pairs) + tickets updates.
function stressTest4() {

    console.log("Stress Test 4 running...")

    const url = 'http://localhost:8080';
    let reservationIds = [];
    const movieNames = ["Interstellar", "The Notebook", "Shrek"];
    const personNames = ["John Doe", "Jane Smith", "Michael Johnson", "Emily Davis", "David Brown"];

    function getRandomMovieName() {
        const randomIndex = Math.floor(Math.random() * movieNames.length);
        return movieNames[randomIndex];
    }

    function getRandomPersonName() {
        const randomIndex = Math.floor(Math.random() * personNames.length);
        return personNames[randomIndex];
    }

    function getRandomTicketCount() {
        return Math.floor(Math.random() * 8) + 1; // random ticket count between 1 and 8
    }

    const instance = autocannon({
        url,
        connections: 2,
        duration: 10,
        headers: {
            "content-type": "application/json"
        },
        requests: [
            {
                method: "POST",
                path: "/reservations",
                setupRequest: (req, context) => {
                    const movieName = getRandomMovieName();
                    const personName = getRandomPersonName();
                    const nTickets = getRandomTicketCount(); 
                    const reservationId = uuidv4();
                    req.body = JSON.stringify({
                        ID: reservationId,
                        movie_name: movieName,
                        person_name: personName,
                        n_tickets: parseInt(nTickets)
                    });

                    reservationIds.push(reservationId);
                    
                    return req;
                }
            },
            {
                method: "PUT",
                path: "/update",
                setupRequest: (req, context) => {
                    const randomIndex = Math.floor(Math.random() * reservationIds.length);
                    const reservationId = reservationIds[randomIndex];

                    const newTicketCount = getRandomTicketCount();
            
                    req.body = JSON.stringify({
                        ID: reservationId,
                        n_tickets: parseInt(newTicketCount)
                    });
            
                    return req;
                }
            },
            {
                method: "DELETE",
                path: "/cancel",
                setupRequest: (req, context) => {
                    const randomIndex = Math.floor(Math.random() * reservationIds.length);
                    const reservationId = reservationIds[randomIndex];
                    req.body = JSON.stringify({ ID: reservationId });
                    return req;
                }
            },
        ]
    }, (err, result) => {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log("Results:", result);
        }
    });
} 


// Uncomment to run all tests 
function runAllTests() {
    stressTest1();
    stressTest2();
    stressTest3();
    stressTest4();
}

runAllTests();

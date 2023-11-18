/**
* @authors Dinis Silvestre, Bruno Martins, Beatriz Correia 
*/ 

console.log("Starting the JavaScript")

window.addEventListener('DOMContentLoaded', event => {

    /**
     * INTERSTELLAR
     */
    document.getElementById("confirm_btn_int").addEventListener("click", function() {    

        var movieName = document.getElementById("movie_insterstellar").textContent; // give me the text context
        var personName = document.getElementById("person_name_int").value;
        var nTickets = document.getElementById("seats_int").value;

        // Check if name is provided
        if (personName.trim() === "") {
            alert("Please enter a name.");
        }

        // Check if number of tickets is selected
        if (nTickets === "") {
            alert("Please select the number of tickets.");
        }

        // Make a GET request to retrieve occupancy details
        fetch("http://localhost:8080/occupancy")
        .then(response => response.json())
        .then(data => {
            // Process the response data and update the elements in your HTML
            const occupancyDetails = data;

            // Check if the reservation can be confirmed based on occupancy details
            const reservedTicketsInt = occupancyDetails[movieName].reserved_tickets;
            const availableSeatsInt = occupancyDetails[movieName].available_seats;
            const totalTickets = reservedTicketsInt + parseInt(nTickets);

            if (totalTickets <= availableSeatsInt) {
                // Proceed with the reservation
                var reservation = {
                    ID: uuidv4(),
                    movie_name: movieName,
                    person_name: personName,
                    n_tickets: parseInt(nTickets)
                };

                console.log("ID: " + reservation.ID);
                console.log("Movie Name: " + reservation.movie_name);
                console.log("Person Name: " + reservation.person_name);

                fetch("http://localhost:8080/reservations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reservation)
                })
                .then(function(response) {
                    if (response.ok) {
                        document.getElementById("person_name_int").value = "";
                        document.getElementById("seats_int").value = "";
                        alert("Reservation confirmed!");
                    }
                    else 
                        alert("Failed to confirm reservation. Please try again.");
                })
                .catch(function(error) {
                    alert("An error occurred while confirming the reservation.");
                    console.log(error);
                });
            } else {
                // Display a warning to the user
                alert("Cannot confirm reservation. Limited availability of seats.");
            }
        })
        .catch(function(error) {
            alert("An error occurred while retrieving occupancy details.");
            console.log(error);
        });    
    });

    /**
     * THE NOTEBOOK
     */
    document.getElementById("confirm_btn_theN").addEventListener("click", function() {    
        
        var movieName = document.getElementById("movie_the_notebook").textContent; // give me the text context
        var personName = document.getElementById("person_name_theN").value;
        var nTickets = document.getElementById("seats_theN").value;

        var reservation = {
            ID: uuidv4(), // Generate a random UUID - Cassandra only allows those types of ID's
            movie_name: movieName, //Interstellar, The Notebook, Shrek
            person_name: personName,
            n_tickets: parseInt(nTickets)   // nTickets -> it's gonna be an Integer - parseInt(nTickets)
        };

        console.log("ID: " + reservation.ID)
        console.log("Movie Name: " + reservation.movie_name)
        console.log("Person Name: " + reservation.person_name)
        
        fetch("http://localhost:8080/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reservation)
        })
        .then(function(response) {
            if (response.ok) {
                document.getElementById("person_name_theN").value = "";
                document.getElementById("seats_theN").value = "";
                alert("Reservation confirmed!");
            }
            else 
                alert("Failed to confirm reservation. Please try again.");
        })
        .catch(function(error) {
            alert("An error occurred while confirming the reservation.");
            console.log(error);
        });
    });

    /**
     * SHREK
     */
    document.getElementById("confirm_btn_shrek").addEventListener("click", function() {    
        
        var movieName = document.getElementById("movie_shrek").textContent; // give me the text context
        var personName = document.getElementById("person_name_shrek").value;
        var nTickets = document.getElementById("seats_shrek").value;

        var reservation = {
            ID: uuidv4(), // Generate a random UUID - Cassandra only allows those types of ID's
            movie_name: movieName, //Interstellar, The Notebook, Shrek
            person_name: personName,
            n_tickets: parseInt(nTickets)   // nTickets -> it's gonna be an Integer - parseInt(nTickets)
        };

        fetch("http://localhost:8080/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reservation)
        })
        .then(function(response) {
            if (response.ok) {
                document.getElementById("person_name_shrek").value = "";
                document.getElementById("seats_shrek").value = ""; 
                alert("Reservation confirmed!");
            }
            else 
                alert("Failed to confirm reservation. Please try again.");
        })
        .catch(function(error) {
            alert("An error occurred while confirming the reservation.");
            console.log(error);
        });
    });

    // LIST RESERVATIONS
    document.getElementById("list-btn").addEventListener("click", function() {
        fetch("http://localhost:8080/list")
        .then(function(response) {
            if (response.ok)
                return response.json();
            else
                throw new Error("Failed to fetch reservations");
        })

        .then(function(data) {
            var reservationsBody = document.getElementById("reservations-body");
            reservationsBody.innerHTML = ""; // Clear previous table rows

            // Sort the reservations by movie name alphabetically
            data.sort(function(a, b) {
                if (a.movie_name < b.movie_name) return -1;
                if (a.movie_name > b.movie_name) return 1;
                return 0;
            });

            var currentMovieName = "";
        
            data.forEach(function(reservation) {
                var row = document.createElement("tr");
        
                var idCell = document.createElement("td");
                idCell.textContent = reservation.reservation_id;
                row.appendChild(idCell);
        
                var movieNameCell = document.createElement("td");
                movieNameCell.textContent = reservation.movie_name;
                row.appendChild(movieNameCell);
        
                var personNameCell = document.createElement("td");
                personNameCell.textContent = reservation.person_name;
                row.appendChild(personNameCell);
        
                var ticketsCell = document.createElement("td");
                ticketsCell.textContent = reservation.n_tickets;
                row.appendChild(ticketsCell);
        
                var editCell = document.createElement("td");
                var editButton = document.createElement("button");
                editButton.className = "btn btn-primary";
                editButton.textContent = "Edit";
                editCell.appendChild(editButton);
        
                var deleteCell = document.createElement("td");
                var CancelButton = document.createElement("button");
                CancelButton.className = "btn btn-primary";
                CancelButton.textContent = "Cancel";
                deleteCell.appendChild(CancelButton);
        
                row.appendChild(editCell);
                row.appendChild(deleteCell);

                // Check if the movie name has changed
                if (currentMovieName !== reservation.movie_name) {
                    // Create a separator row for the new movie name
                    var separatorRow = document.createElement("tr");
                    var separatorCell = document.createElement("td");
                    separatorCell.setAttribute("colspan", "5");
                    separatorCell.textContent = reservation.movie_name;
                    separatorCell.style.fontWeight = "bold";
                    separatorRow.appendChild(separatorCell);
                    reservationsBody.appendChild(separatorRow);

                    currentMovieName = reservation.movie_name;
                }

        
                reservationsBody.appendChild(row);
        
                // Edit Button Event Listener
                editButton.addEventListener("click", function() {
                var editCell = this.parentNode;
                var ticketsCell = editCell.previousElementSibling;
                var initNumbTickets = "";
        
                // Disable other buttons while editing
                editButton.disabled = true;
                CancelButton.disabled = true;
        
                // Create select element with ticket options
                var ticketOptions = document.createElement("select");
                for (var i = 1; i <= 8; i++) {
                    var option = document.createElement("option");
                    option.value = i;
                    option.textContent = i;
                    ticketOptions.appendChild(option);
                }
        
                // Set initial value to current number of tickets
                ticketOptions.value = ticketsCell.textContent;
                initNumbTickets = ticketsCell.textContent;
        
                // Replace tickets cell content with the select element
                ticketsCell.textContent = "";
                ticketsCell.appendChild(ticketOptions);
        
                // Create "Cancel Edit" button
                var cancelEditButton = document.createElement("button");
                cancelEditButton.className = "btn btn-primary";
                cancelEditButton.textContent = "Cancel Edit";
                cancelEditButton.style.marginRight = "5px"; // Apply right margin of 5 pixels
                editCell.textContent = "";
                editCell.appendChild(cancelEditButton);
                
                // Create "Confirm Edit" button
                var confirmEditButton = document.createElement("button");
                confirmEditButton.className = "btn btn-primary";
                confirmEditButton.textContent = "Confirm Edit";
                editCell.appendChild(confirmEditButton);
        
                // Cancel Edit Button Event Listener
                cancelEditButton.addEventListener("click", function() {
                    // Revert changes and enable buttons
                    ticketsCell.textContent = initNumbTickets;
                    editCell.textContent = "";
                    editCell.appendChild(editButton);
                    editButton.disabled = false;
                    CancelButton.disabled = false;
                });
                
                /**
                 * Confirm Edit Button Event Listener
                 * Update Reservation
                 */
                confirmEditButton.addEventListener("click", function() {
                    // Perform update operation (send to server or update data locally)
                    var updatedTickets = ticketOptions.value;
                
                    // Retrieve the occupancy details for the movie from Cassandra
                    fetch("http://localhost:8080/occupancy")
                        .then(response => response.json())
                        .then(data => {
                            const occupancyDetails = data;


                            const movieName = movieNameCell.textContent;
                            const reservedTickets = occupancyDetails[movieName].reserved_tickets + parseInt(updatedTickets);
                            const availableSeats = occupancyDetails[movieName].available_seats;
                
                            if (reservedTickets <= availableSeats) {
                                var updateReservation = {
                                    ID: idCell.textContent,
                                    n_tickets: parseInt(updatedTickets)
                                };
                
                                console.log(idCell.textContent);
                                console.log(parseInt(updatedTickets));
                
                                fetch("http://localhost:8080/update", {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify(updateReservation)
                                })
                                    .then(function(response) {
                                        if (response.ok)
                                            alert("Reservation updated successfully!");
                                        else
                                            alert("Failed to update reservation. Please try again.");
                                    })
                                    .catch(function(error) {
                                        alert("An error occurred while updating the reservation.");
                                        console.log(error);
                                    });
                
                                console.log("Updated Tickets:", updatedTickets);
                
                                // Update tickets cell with new value
                                ticketsCell.textContent = updatedTickets;
                            } 
                            else {
                                // Display an error message if the reserved tickets exceed the available seats
                                alert("Failed to update reservation. The number of tickets exceeds the available seats for " + movieName + ".");
                            }
                
                            // Revert edit cell back to edit button
                            editCell.textContent = "";
                            editCell.appendChild(editButton);
                            editButton.disabled = false;
                            CancelButton.disabled = false;
                        })
                        .catch(function(error) {
                            alert("An error occurred while fetching occupancy details.");
                            console.log(error);
                        });
                });
        
                /**
                 * Delete Button Event Listener
                 * Cancel Reservation
                 */
                // 
                CancelButton.addEventListener("click", function() {

                    console.log(idCell.textContent)

                    fetch("http://localhost:8080/cancel", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ ID: idCell.textContent })
                    })
                    .then(function(response) {
                        if (response.ok) 
                            alert("Reservation cancelled successfully!");
                        else 
                            alert("Failed to cancel reservation. Please try again.");
                        
                    })
                    .catch(function(error) {
                        alert("An error occurred while cancelling the reservation.");
                        console.log(error);
                    });

                // Perform delete operation (send to server or delete data locally)
                console.log("Delete Reservation:", idCell.textContent);
        
                // Remove the row from the table
                row.parentNode.removeChild(row);
                });
            });
            })
        .catch(function(error) {
            console.error("Error:", error);
        });
    });
});

    /**
     * Occupancy Button Event Listener
     * Retrieved occupancy data from Cassandra and stored it in 'occupancyData'
     */
    fetch("http://localhost:8080/occupancy")
        .then(response => response.json())
        .then(data => {
            // Process the response data and update the elements in your HTML
            const occupancyDetails = data;

            /** INTERSTELLAR */
            const movieNameInt = "Interstellar"; // Replace with the desired movie name
            const reservedTicketsInt = occupancyDetails[movieNameInt].reserved_tickets;
            const availableSeatsInt = occupancyDetails[movieNameInt].available_seats;

            const occupancyInfoElementInt = document.querySelector(".occupancy_info_int");
            const occupancyStatusElementInt = occupancyInfoElementInt.querySelector(".occupancy_status_int");
            const ticketsLeftElementInt = occupancyInfoElementInt.querySelector(".tickets_left_int");

            let ticketsLeftInfoElementInt = document.querySelector(".tickets_left_info_int");
            ticketsLeftInfoElementInt.innerHTML = ""; // Clear any existing content
            ticketsLeftInfoElementInt.appendChild(ticketsLeftElementInt);

            /** THE NOTEBOOK */
            const movieNameTheN = "The Notebook"; // Replace with the desired movie name
            const reservedTicketsTheN = occupancyDetails[movieNameTheN].reserved_tickets;
            const availableSeatsTheN = occupancyDetails[movieNameTheN].available_seats;

            const occupancyInfoElementTheN = document.querySelector(".occupancy_info_theN");
            const occupancyStatusElementTheN = occupancyInfoElementTheN.querySelector(".occupancy_status_theN");
            const ticketsLeftElementTheN = occupancyInfoElementTheN.querySelector(".tickets_left_theN");

            let ticketsLeftInfoElementTheN = document.querySelector(".tickets_left_info_theN");
            ticketsLeftInfoElementTheN.innerHTML = ""; // Clear any existing content
            ticketsLeftInfoElementTheN.appendChild(ticketsLeftElementTheN);

            /** SHREK */
            const movieNameShr = "Shrek"; // Replace with the desired movie name
            const reservedTicketsShr = occupancyDetails[movieNameShr].reserved_tickets;
            const availableSeatsShr = occupancyDetails[movieNameShr].available_seats;

            const occupancyInfoElementShr = document.querySelector(".occupancy_info_shr");
            const occupancyStatusElementShr = occupancyInfoElementShr.querySelector(".occupancy_status_shr");
            const ticketsLeftElementShr = occupancyInfoElementShr.querySelector(".tickets_left_shr");

            let ticketsLeftInfoElementShr = document.querySelector(".tickets_left_info_shr");
            ticketsLeftInfoElementShr.innerHTML = ""; // Clear any existing content
            ticketsLeftInfoElementShr.appendChild(ticketsLeftElementShr);

            console.log(reservedTicketsInt)
            console.log(availableSeatsInt)
            console.log(reservedTicketsInt === availableSeatsInt)

            // Update the occupancy status based on the reserved tickets and available seats
            if ((reservedTicketsInt/availableSeatsInt) < 0.8) {
                // INTERSTELLAR
                occupancyStatusElementInt.classList.add("green");
                occupancyStatusElementInt.classList.remove("red", "yellow");
                occupancyStatusElementInt.textContent = "AVAILABLE";
                ticketsLeftElementInt.textContent = (availableSeatsInt - reservedTicketsInt) + " tickets left!";
            }

            if ((reservedTicketsTheN/availableSeatsTheN) < 0.8) {
                // THE NOTEBOOK
                occupancyStatusElementTheN.classList.add("green");
                occupancyStatusElementTheN.classList.remove("red", "yellow");
                occupancyStatusElementTheN.textContent = "AVAILABLE";
                ticketsLeftElementTheN.textContent = (availableSeatsTheN - reservedTicketsTheN) + " tickets left!";
            }

            if ((reservedTicketsShr/availableSeatsShr) < 0.8) {
                // SHREK
                occupancyStatusElementShr.classList.add("green");
                occupancyStatusElementShr.classList.remove("red", "yellow");
                occupancyStatusElementShr.textContent = "AVAILABLE";
                ticketsLeftElementShr.textContent = (availableSeatsShr - reservedTicketsShr) + " tickets left!";
            }
            if (reservedTicketsInt === availableSeatsInt) {
                // INTERSTELLAR
                occupancyStatusElementInt.classList.add("red");
                occupancyStatusElementInt.classList.remove("green", "yellow");
                occupancyStatusElementInt.textContent = "SOLD OUT";
                ticketsLeftElementInt.textContent = "No tickets left!";
            }
            if (reservedTicketsTheN === availableSeatsTheN) {
                // THE NOTEBOOK
                occupancyStatusElementTheN.classList.add("red");
                occupancyStatusElementTheN.classList.remove("green", "yellow");
                occupancyStatusElementTheN.textContent = "SOLD OUT";
                ticketsLeftElementTheN.textContent = "No tickets left!";
            }
            if (reservedTicketsShr === availableSeatsShr) {
                // SHREK
                occupancyStatusElementShr.classList.add("red");
                occupancyStatusElementShr.classList.remove("green", "yellow");
                occupancyStatusElementShr.textContent = "SOLD OUT";
                ticketsLeftElementShr.textContent = "No tickets left!";
            }
            if ((reservedTicketsInt/availableSeatsInt) >= 0.8 && reservedTicketsInt !== availableSeatsInt) {
                // INTERSTELLAR
                occupancyStatusElementInt.classList.add("yellow");
                occupancyStatusElementInt.classList.remove("green", "red");
                occupancyStatusElementInt.textContent = "ALMOST SOLD OUT";
                ticketsLeftElementInt.textContent = (availableSeatsInt - reservedTicketsInt) + " ticket(s) left!";
            }
            if ((reservedTicketsTheN/availableSeatsTheN) >= 0.8  && reservedTicketsTheN !== availableSeatsTheN) {
                // THE NOTEBOOK
                occupancyStatusElementTheN.classList.add("yellow");
                occupancyStatusElementTheN.classList.remove("green", "red");
                occupancyStatusElementTheN.textContent = "ALMOST SOLD OUT";
                ticketsLeftElementTheN.textContent = (availableSeatsTheN - reservedTicketsTheN) + " ticket(s) left!";
            }
            if ((reservedTicketsShr/availableSeatsShr) >= 0.8  && reservedTicketsShr !== availableSeatsShr) {
                // SHREK
                occupancyStatusElementShr.classList.add("yellow");
                occupancyStatusElementShr.classList.remove("green", "red");
                occupancyStatusElementShr.textContent = "ALMOST SOLD OUT";
                ticketsLeftElementShr.textContent = (availableSeatsShr - reservedTicketsShr) + " ticket(s) left!";
            }
        })
        .catch(error => {
            // Handle any errors that occur during the request or response
            console.log("Failed to retrieve occupancy details:", error);
        });

    

    






    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

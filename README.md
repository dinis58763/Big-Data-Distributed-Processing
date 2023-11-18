# Big-Data-Distributed-Processing

This project consists of a web application that manages the reservations for 3 movies at a fictitious cinema using a Cassandra Cluster with 2 nodes.
The user is allowed to make a reservation with a maximum of 8 seats and can then edit or cancel the reservation.
These actions are intuitive given the design of the website.

How to run our program:

1. Run the nodes of the Cassandra Cluster (Docker containers)

2. Set up the tables for the database:
$ python main.py $

3. Start the server of the web application:
$ python httpserver.py $

4. Run the html web page

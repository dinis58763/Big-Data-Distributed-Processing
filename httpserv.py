import uuid
import tornado.ioloop
import tornado.web
import json
from cassandra import InvalidRequest, ReadTimeout
from cassandra.cluster import Cluster, BatchStatement, SimpleStatement

# clstr=Cluster(['172.17.0.2','172.17.0.3'])
clstr = Cluster()
session = clstr.connect('cinema_reservation')
print("connected to database")

# STATEMENTS
insert_reservation_stmt = session.prepare("INSERT INTO reservations (reservation_id, movie_name, person_name, n_tickets) VALUES (?, ?, ?, ?);")
list_reservations_stmt = session.prepare("SELECT * FROM reservations;")
update_reservation_stmt = session.prepare("UPDATE reservations SET n_tickets = ? WHERE reservation_id = ?;")
cancel_reservation_stmt = session.prepare("DELETE FROM reservations WHERE reservation_id = ?;")

# ADD RESERVATION
class ReservationsHandler(tornado.web.RequestHandler):

    # JavaScript code is running on http://127.0.0.1:5500, while to make a request to http://localhost:8080. 
    # URLs have different origins, the browser enforces the same-origin policy by default, restricts the request.
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "http://127.0.0.1:5500")  # Replace with your frontend URL
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    def options(self):
        # Handle preflight OPTIONS request
        self.set_status(204)
        self.finish()
    
    def post(self):
        try:
            reservation = json.loads(self.request.body.decode("utf-8"))
            res_id = uuid.UUID(reservation["ID"])
            movie_name = reservation["movie_name"]
            person_name = reservation["person_name"]
            n_tickets = reservation["n_tickets"]
            session.execute(insert_reservation_stmt, [res_id, movie_name, person_name, n_tickets])
            self.set_status(201)  # Created
            self.write("Added Restaurant")
            print("Added Restaurant")

        except Exception as e:
            print("Failed to create reservation: ", str(e))
            self.set_status(500)  # Internal Server Error
            self.write("Failed to create reservation")

# SEE RESERVATION
class ListReservationsHandler(tornado.web.RequestHandler):

    # JavaScript code is running on http://127.0.0.1:5500, while to make a request to http://localhost:8080. 
    # URLs have different origins, the browser enforces the same-origin policy by default, restricts the request.
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "http://127.0.0.1:5500")  # Replace with your frontend URL
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    def options(self):
        # Handle preflight OPTIONS request
        self.set_status(204)
        self.finish()

    def get(self):
        try:
            result = session.execute(list_reservations_stmt)
            reservations = []
            for row in result:
                reservation = {
                    "reservation_id": str(row.reservation_id),
                    "movie_name": row.movie_name,
                    "person_name": row.person_name,
                    "n_tickets": row.n_tickets
                }
                reservations.append(reservation)
            self.set_status(200)  # OK
            self.write(json.dumps(reservations))
            print("Listed Reservations")
        except Exception as e:
            print("Failed to list reservations: ", str(e))
            self.set_status(500)  # Internal Server Error
            self.write("Failed to list reservations")

# UPDATE RESERVATION
class UpdateReservationHandler(tornado.web.RequestHandler):

    # JavaScript code is running on http://127.0.0.1:5500, while to make a request to http://localhost:8080. 
    # URLs have different origins, the browser enforces the same-origin policy by default, restricts the request.
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "http://127.0.0.1:5500")  # Replace with your frontend URL
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    def options(self):
        # Handle preflight OPTIONS request
        self.set_status(204)
        self.finish()

    def put(self):
        try:
            reservation = json.loads(self.request.body.decode("utf-8"))
            res_id = uuid.UUID(reservation["ID"])
            n_tickets = reservation["n_tickets"]
            session.execute(update_reservation_stmt, [n_tickets, res_id])
            self.set_status(200)  # OK
            self.write("Reservation Updated")
            print("Reservation Updated")

        except Exception as e:
            print("Failed to update reservation: ", str(e))
            self.set_status(500)  # Internal Server Error
            self.write("Failed to update reservation")

# DELETE RESERVATION
class CancelReservationHandler(tornado.web.RequestHandler):

    # JavaScript code is running on http://127.0.0.1:5500, while to make a request to http://localhost:8080. 
    # URLs have different origins, the browser enforces the same-origin policy by default, restricts the request.
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "http://127.0.0.1:5500")  # Replace with your frontend URL
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    def options(self):
        # Handle preflight OPTIONS request
        self.set_status(204)
        self.finish()

    def delete(self):
        try:
            # res_id = self.get_argument("ID")
            reservation = json.loads(self.request.body.decode("utf-8"))
            res_id = uuid.UUID(reservation["ID"])
            session.execute(cancel_reservation_stmt, [res_id])
            self.set_status(200)  # OK
            self.write("Reservation Canceled")
            print("Reservation Canceled")
        except Exception as e:
            print("Failed to cancel reservation: ", str(e))
            self.set_status(500)  # Internal Server Error
            self.write("Failed to cancel reservation")


# OCCUPANCY DETAILS
class OccupancyDetailsHandler(tornado.web.RequestHandler):

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "http://127.0.0.1:5500")  # Replace with your frontend URL
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    def options(self):
        self.set_status(204)
        self.finish()

    def get(self):
        try:
            occupancy_details = {}
            rows = session.execute("SELECT * FROM movies")
            for row in rows:
                movie_name = row.movie_name
                available_seats = row.available_seats
                reservations = session.execute("SELECT SUM(n_tickets) FROM reservations WHERE movie_name = %s ALLOW FILTERING", [movie_name])
                reserved_tickets = reservations.one()[0]
                occupancy_details[movie_name] = {
                    "available_seats": available_seats,
                    "reserved_tickets": reserved_tickets
                }
            
            self.set_status(200)  # OK
            self.write(json.dumps(occupancy_details))
            print("Retrieved Occupancy Details")
        except Exception as e:
            print("Failed to retrieve occupancy details: ", str(e))
            self.set_status(500)  # Internal Server Error
            self.write("Failed to retrieve occupancy details")


def make_app():
    return tornado.web.Application([
        ("/reservations", ReservationsHandler),
        ("/list", ListReservationsHandler),
        ("/update", UpdateReservationHandler),
        ("/cancel", CancelReservationHandler),
        ("/occupancy", OccupancyDetailsHandler),
    ])


app = make_app()

app.listen(8080)
print("server Started")
tornado.ioloop.IOLoop.current().start()

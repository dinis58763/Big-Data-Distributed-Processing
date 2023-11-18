from cassandra import InvalidRequest, ReadTimeout
from cassandra.cluster import Cluster, BatchStatement, SimpleStatement

clstr = Cluster(['172.17.0.2','172.17.0.3','172.17.0.4']) # clstr = Cluster(['127.0.0.2']) 
session = clstr.connect('cinema_reservation')

print(session)
print(clstr)

# create Table called "Movies"
create_movies = "CREATE TABLE IF NOT EXISTS Movies (movie_name text, genre text, available_seats int, PRIMARY KEY(movie_name));"
session.execute(create_movies)

# remove all the rows from the "Movie" table
deleteAllDataM = "TRUNCATE Movies;"
session.execute(deleteAllDataM)

#insert movies into the table "Movies":
insert_movie1 = "INSERT INTO Movies (movie_name, genre, available_seats) VALUES ('Interstellar', 'Sci-fi', 200) IF NOT EXISTS;"
session.execute(insert_movie1)

insert_movie2 = "INSERT INTO Movies (movie_name, genre, available_seats) VALUES ('The Notebook', 'Drama', 130) IF NOT EXISTS;"
session.execute(insert_movie2)

insert_movie3 = "INSERT INTO Movies (movie_name, genre, available_seats) VALUES ('Shrek', 'Animation', 150) IF NOT EXISTS;"
session.execute(insert_movie3)


# create Table called "reservations"
create_reservations = "CREATE TABLE IF NOT EXISTS reservations (reservation_id UUID, movie_name text, person_name text, n_tickets int, PRIMARY KEY(reservation_id));"
session.execute(create_reservations)

# remove all the rows from the "Movie" table
deleteAllDataR = "TRUNCATE reservations;"
session.execute(deleteAllDataR)
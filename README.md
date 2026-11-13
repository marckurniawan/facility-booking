## Design Notes

### Backend
#### Concurrency
- Booking overlap is enforced directly in the database using an `EXCLUDE USING GIST` constraint. The alternative is a check-then-insert approach in the application layer, but the simple implementation is vulnerable to race conditions under concurrent requests. It can be made safe using `SERIALIZABLE` transactions or locking, but this adds complexity and makes enforcement of the rule more dependent on application code.
#### Password Hashing
- A bcrypt cost factor of 10 makes offline password guessing more computationally expensive for attackers who obtain a copy of the users table, while keeping hashing time manageable for users during registration and login. Each increase of one round approximately doubles the hashing workload, so higher values also increase server CPU usage and authentication latency under load.
## Design Notes

### Backend
- Booking overlap is enforced directly in the database using an `EXCLUDE USING GIST` constraint. The alternative is a check-then-insert approach in the application layer, but the simple implementation is vulnerable to race conditions under concurrent requests. It can be made safe using `SERIALIZABLE` transactions or locking, but this adds complexity and makes enforcement of the rule more dependent on application code.
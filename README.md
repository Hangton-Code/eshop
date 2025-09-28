# Improvements that can be made

1. write an alogirthm that recommends products to users
2. use non-relational database for storing ai chat messages, since with attributes on stuff like tool calling those messages are more like documents, and storing all the data in a table field through one single json object is like storing multiple values on one single field, which does not align with 1NF.
3. the current vector search algorithm is yet to be well designed. and the efficiency (indicated by the speed) is quite poor indeed. can improve by indexing the vectors in the database

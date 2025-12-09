# Flow Message Types

**URL:** https://www.mangomint.com/learn/flow-message-types/

## Category
11 Automated Flows And Messages

## Subcategory
N/A

## Article Content

HOME
AUTOMATED FLOWS
CREATING FLOWS
Flow Message Types
IN THIS ARTICLE
Non-marketing messages
Marketing messages
Merge tags

When you add an email or text message to a flow, you need to select a message type for each message. You can select the non-marketing option or the marketing option.

Link copied
Non-marketing messages

If the message is a non-marketing message, select the non-marketing option (Appointment-related, Sale-related, etc).

Use this option if the message:

Is sent within 14 days of when the flow run started

Contains information related to the flow trigger (e.g. appointment-related information)

Non-marketing message type

	

Description




Non-marketing texts

	

• Non-marketing texts will be sent from the same phone number as your automated text messages and (PLACEHOLDER SEE ERROR LOG).

• If a client unsubscribes from one of these texts, they will also be unsubscribed from all appointment-related texts (booking confirmations, appointment reminders, etc).




Non-marketing emails

	

• Non-marketing emails will be sent from the same email address as your email campaigns. Your email address from Apps > Settings > Business Setup > Locations will be used as the reply-to address.

• If a client unsubscribes from one of these emails, they will also be unsubscribed from all appointment-related emails (booking confirmations, appointment reminders, etc).

You can manage a client’s message preferences in their client details. Clients must have Appointment related messages enabled in their client details to receive non-marketing messages sent via a flow.

Link copied
Marketing messages

If the message is a marketing message, select the Marketing option.

Use this option if the message:

Is sent more than 14 days after the flow run started (even if the message is appointment or sale-related)

Contains marketing information (e.g. special offers or promotions)

Marketing message type

	

Description




Marketing texts

	

• Marketing texts will be sent from your marketing phone number. You will need to register for a marketing phone number.

• By using a marketing phone number, you will ensure that if a client unsubscribes, they will only be unsubscribed from marketing texts and not appointment-related texts (booking confirmations, appointment reminders, etc).




Marketing emails

	

• Marketing emails will be sent from the same email address as your email campaigns. Your email address from Apps > Settings > Business Setup > Locations will be used as the reply-to address.

• If a client unsubscribes from one of these emails, they will be unsubscribed from all marketing flow emails and email campaigns.

You can manage a client’s message preferences in their client details. Clients must have Marketing messages enabled in their client details to receive marketing messages sent via a flow.

Link copied
Merge tags

You can add merge tags to non-marketing and marketing flow messages, including:

Business name: Add your business name to the message. If you have multiple locations, this merge tag does not include the location name.

Phone number: Add your business phone number to the message. This merge tag uses the phone number for the location of the appointment, sale, or membership that triggered the flow.

Online booking link: Add your online booking link to the message. If you have multiple locations enabled for online booking, this merge tag is not location-specific.

Custom merge tags: When creating form templates, you can enable the Available in flows toggle for specific form fields to use those responses as merge tags with the Form submitted trigger, as shown below. Learn more about using form responses with flows.

Merge tags can be added to flow text messages, emails, and email subject lines.

The available merge tags vary depending on which flow trigger is being used.

The table below outlines all the available merge tags for each flow trigger.

Trigger

	

Merge tags for texts & emails (including email subject lines)




• Appointment completed

• Before appointment starts

• Appointment booked

• Appointment canceled

	

Appointment merge tags:

• Service name(s)

• Staff member(s)

• Date

• Time

• Forms link

• Appointment info block (flow emails only)

Client merge tags:

• First name

• Last name

• Email

• Phone

• Client Profile Link (client portal)

Business merge tags:

• Business name

• Phone number

• Online booking link




• Membership started

• Membership canceled

• Before membership credits expire

	

Client merge tags:

• First name

• Last name

• Email

• Phone

• Client Profile Link (client portal)

Business merge tags:

• Business name

• Phone number

• Online booking link

Membership merge tags:

• Membership name

• Credits remaining

• Credits expiration date




Form submitted

	

Client merge tags:

• First name

• Last name

• Email

• Phone

• Client Profile Link (client portal)

Business merge tags:

• Business name

• Phone number

• Online booking link

Form merge tags:

• Form name

• Learn how to set up a form field to use as a custom merge tag.




Client birthday

	

Client merge tags:

• First name

• Last name

• Email

• Phone

• Client Profile Link (client portal)

Business merge tags:

• Business name

• Phone number

• Online booking link




Sale closed

	

Client merge tags:

• First name

• Last name

• Email

• Phone

• Client Profile Link (client portal)

Business merge tags:

• Business name

• Phone number

• Online booking link

Sale merge tags:

• Amount

• Date




Before package credits expire

	

Client merge tags:

• First name

• Last name

• Email

• Phone

• Client Profile Link (client portal)

Business merge tags:

• Business name

• Phone number

• Online booking link

Package merge tags:

• Package name

• Package credits remaining

• Package expiration date

Can't find what you're looking for?

Start a chat with us to talk to a real person and get your questions answered, or browse our on-demand videos.

© Mangomint, Inc. All rights reserved.

## Images and Screenshots

This article contains the following images:

1. **Untitled image**
   - Source: data:image/svg+xml;charset=utf-8,%3Csvg%20height='442'%20width='640'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E

2. **Untitled image**
   - Source: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAOABQDAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAIJ/8QAIRAAAgIBBAIDAAAAAAAAAAAAAQIDEQAEEzFREiJBgaH/xAAXAQADAQAAAAAAAAAAAAAAAAAAAQID/8QAGREBAQEBAQEAAAAAAAAAAAAAAAERITFB/9oADAMBAAIRAxEAPwDTibWSQABUeT59Tl5ok36uObdshTECKryIv7xCzvCECOLYKp6Lk/uLTyjVeUzXHHuuE7xU56aNKQAA/ArjIvWssj//2Q==

3. **Untitled image**
   - Source: https://images.ctfassets.net/oco7uqwlyque/5in50nNbqamwEkX17pEKet/b2a5ca9229cdb5c0bb128aea448691bd/lc-flow-message-type-1.jpg?w=640&h=442&fl=progressive&q=90&fm=jpg&bg=transparent

4. **Untitled image**
   - Source: data:image/svg+xml;charset=utf-8,%3Csvg%20height='380'%20width='640'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E

5. **Untitled image**
   - Source: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAMABQDAREAAhEBAxEB/8QAFwABAAMAAAAAAAAAAAAAAAAABAIDCf/EACIQAAIBAwIHAAAAAAAAAAAAAAECAwAREgQxISIyQVGRof/EABcBAQEBAQAAAAAAAAAAAAAAAAECAAP/xAAYEQEBAQEBAAAAAAAAAAAAAAAAARECQf/aAAwDAQACEQMRAD8A04m1ckAAVHk78pq81pN9WRSma+KGO4tjkRfh5oFmFJBmLtHidupj9o1g7XqkpRxiVwjbHeimXDotIixqAz+6mx0nVf/Z

6. **Untitled image**
   - Source: https://images.ctfassets.net/oco7uqwlyque/3CgelVSnh2enc3FT0YuwWF/1e9613eb4731976a4f99dfd88b778a47/lc-flow-message-type-2.jpg?w=640&h=380&fl=progressive&q=90&fm=jpg&bg=transparent

7. **Untitled image**
   - Source: data:image/svg+xml;charset=utf-8,%3Csvg%20height='581'%20width='640'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E

8. **Untitled image**
   - Source: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAASABQDAREAAhEBAxEB/8QAFgAAAwAAAAAAAAAAAAAAAAAAAwgJ/8QALBAAAQIFAwIEBwEAAAAAAAAAAQIDAAQFBhEHEiEIEzFBUWEUN0JDcXKRk//EABgBAAMBAQAAAAAAAAAAAAAAAAABAgMF/8QAHBEAAgIDAQEAAAAAAAAAAAAAAAECEQMSIQVR/9oADAMBAAIRAxEAPwA3RvZVvT+vlutTdBps00WZpRbelULTnsq5wQYrZg+lDlaMafsNsIdtKiObEbe67TWStfuo7OTFbybtE0gR0msFS1AWPRFJSdoWqmy53DHiOPDy59Ie0vocEM6MlKRr7bpSCo/DzXnj7KoyKRSZ8B2abDm5JLZ4Tkg8/wAzDQOghbbBx2zj8GDouE0ejr58277sTWf8VQhjU9HlwVSvP6oip1KcqIlLtm5eWE2+p3stADCEbidqR6DiO16cIwWHVVcEzHG22xifqV+xjimx/9k=

9. **Untitled image**
   - Source: https://images.ctfassets.net/oco7uqwlyque/455ejwSoMZAUbkH4MQwsTU/aec5c88848a3b6ddc77edf06693bcdac/lc-flow-message-type-3.jpg?w=640&h=581&fl=progressive&q=90&fm=jpg&bg=transparent

10. **Untitled image**
   - Source: data:image/svg+xml;charset=utf-8,%3Csvg%20height='431'%20width='640'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E

11. **Untitled image**
   - Source: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAANABQDAREAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAgMEBQn/xAAiEAACAQMDBQEAAAAAAAAAAAABAgADBBESMWETISJBUaH/xAAXAQEBAQEAAAAAAAAAAAAAAAABAAID/8QAGREBAAIDAAAAAAAAAAAAAAAAAAEREjFh/9oADAMBAAIRAxEAPwDT5KjZA1kDP2bZEwIqFR4g+s4G0EclDWMsgU7bs37KyhlQR3iA2tmgrBQWGrmUt5TO1olr01CrUcAczmb4/9k=

12. **Untitled image**
   - Source: https://images.ctfassets.net/oco7uqwlyque/7xN1xfcHtuJzG5uhLeaZm8/c036ef76b11471c9b5933e87fe2cdd5e/lc-flow-message-type-4.jpg?w=640&h=431&fl=progressive&q=90&fm=jpg&bg=transparent

13. **Untitled image**
   - Source: data:image/svg+xml;charset=utf-8,%3Csvg%20height='581'%20width='640'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E

14. **Untitled image**
   - Source: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAASABQDAREAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAwgJAv/EACsQAAECBQMCBAcAAAAAAAAAAAECAwAEBQYRBxIhCBMxQVFhQkRxcoORk//EABgBAAMBAQAAAAAAAAAAAAAAAAABAgMF/8QAHREAAgICAwEAAAAAAAAAAAAAAAECERIhAwVRMf/aAAwDAQACEQMRAD8AN0b2Vb0/r5brU3QabNNFmaUW3pVC057KucEGKyYPZQ5WjGn7DbCHbSojmxG3uu01krX7qOzkxWcm7RNIEdJrBUtQFj0RSUnaFqpsudwx4jjw8ufSHlL0NCGdGTnb19t1Wfl5oZ/CqMivpSd/Y9NNhSlbi2eACRjP6zDQNUbLbYOO2cfQwbFomj0dc68277sTWf4qhDGr6Pq/U64/qgmpVGbqAlLsm5eXE0+p3stADCEbidqR6DiO32cIQXDiquCZjxttu/Rh/iV9xjiGx//Z

15. **Untitled image**
   - Source: https://images.ctfassets.net/oco7uqwlyque/pZc81XS0mYG7hoJdB1hTg/8b8bb17eb246f7c27678f8ec43a1d741/lc-flow-message-type-5.jpg?w=640&h=581&fl=progressive&q=90&fm=jpg&bg=transparent

16. **Untitled image**
   - Source: data:image/svg+xml;charset=utf-8,%3Csvg%20height='394'%20width='640'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E

17. **Untitled image**
   - Source: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAMABQDAREAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAwQFCf/EACIQAAIBAwMFAQAAAAAAAAAAAAECAwARIRIxMgQTQVFhof/EABcBAQEBAQAAAAAAAAAAAAAAAAIBAAP/xAAYEQEBAQEBAAAAAAAAAAAAAAAAEQESQf/aAAwDAQACEQMRAD8A04m6uWEAKjyecGnGzL6JFKZSSE7Vxx1EXx7qJuQwqauURB2wWb9qUuaVtScxIEDyqp2OKyqUUQjQKCbfTQJ//9k=

18. **Untitled image**
   - Source: https://images.ctfassets.net/oco7uqwlyque/2rXhI1iBNW4MWX9WJuDyaQ/1981ef33bce080b57836e5942358613d/lc-flow-text-segments-3.jpg?w=640&h=394&fl=progressive&q=90&fm=jpg&bg=transparent

19. **Untitled image**
   - Source: data:image/svg+xml;charset=utf-8,%3Csvg%20height='555'%20width='640'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E

20. **Untitled image**
   - Source: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAARABQDAREAAhEBAxEB/8QAGAABAQADAAAAAAAAAAAAAAAABQMCBAn/xAAjEAABAwIFBQAAAAAAAAAAAAABAAIDESEEEiIxcRMyNEGB/8QAFgEBAQEAAAAAAAAAAAAAAAAAAgAB/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwDp51iwCshA93TwWWmtI5C4EXpZSbTIIi3VG4H6jpYOkhZL3Ma7kJy2DqmHaIXDI0AC4aLLLdROE5o202pygQxMFcL5DOVlbCQ2RJ//2Q==

21. **Untitled image**
   - Source: https://images.ctfassets.net/oco7uqwlyque/4PVHXaqrru2vGayNTFDRBr/3e14f999a6b02cae7e7bff0c0310d749/lc-flow-message-type-6.jpg?w=640&h=555&fl=progressive&q=90&fm=jpg&bg=transparent

22. **Untitled image**
   - Source: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEEklEQVR42n1UXWgcVRQ+O2kMWulPsjvn3J17zm7StNJitCUNiLaIaSQze+/cTdIEQmxrsJZGH2qxBdEiRQtS/AmIkRYULCj4YqEKRdBCq+KDiA/6FKGCgiDFF2vpQ+nDyL2zlUaKFy7Mzp75zvnOd84HcIezmlJYV7cQs4uqyTZAtqAkDZckBdQGqH7cv498POo5QO3gjmfzplm4h3ZBTZuumNtQ0zuB2G5Rkj6tJH2JJH0GtdlebVQBOQfkNKryHMQ8BT5+xVlLBu7FABbFPlgmhpDNV8itgsLNCpLyGbn1E7EbRW5BXUYrNZ4DbM6uBOytO4jZRjE7IHGmA3SD2B5HtsNKjCbOh4jzw8jmSgmcL5DOgPR4lGx7bSUgsYuQ20A8sQXZFMhmmWQmQTahj8QGKNC00Kv3341sz2MAdeOxziHmPPoXTLGDGj9WiXkMkM3nPlDp3eIToDbdXgAlWUWxjZDz7phnoD5wtBvZ/EpsLg/dt1TRjfnbq7MVn53YDZZU7OuoWx68p3/D3k5MG/rYQJ/2rcm7vSgk+XzZ33yM2AIocZDIbg/YpQIlM10Cuu3YoRjLeER6ElBPBNCazkGJrSjOQXEuAVBaL/uWQKM5DYPNeYg5XVUC2IMkWaHEnCExR4jzbTGnoJJ9gDxZQZ7wgvnElVChdms9oOJs0SsOmwb3QJXHK1X29Nw+EnNTNXyFAbQg8eLYt6ebBSjeC8SToBpToDotUuz6S8rmWKAchyZ7BfM2iilqSfod3DU0PLJ1YT1AX71XjZ/ugC4iZ2GQlbS90l2l6nah06JHfMVAyRwoOtRFYn6rJenlZ2fP9i5/XBz55vSNSz98ULzqxeirp+9TqNbdr8T30XSjtHpIWkBiTpQVtjWyC+r68rd6ej29Ow78eb5of/HOXz9fPHXt6wtLV5d//LDYDzDQXwLaw2Wfs3Kn/XyKnUS/PWIfIrEQhlWxTf1axdq4Xz4pdn+5dPXEpdPXX7h46vrxb9+7+VR/c2ZNmEtpnUE2I8jmJHLrI+TWUWJzMqwk231BZRI/Avlmv6N99fEXi9+L6rk3/8guvPv3o58tXsmK74v6mvjxB8IOS9bZ6XCvle9u/W63qaTsoM7tdf4PZPNW0ihtqCiKrmBNPAYxm7MdJQ8h20kSN4DJTKTEamI7huJ2bRx5A9SGJ8seEtsdHSdZQrZP1JLMrafRerWeDSObT0uTyF9BbwJiO7blwrP/HiWHZONBoP49nrJXqvVcoCMde7pFL1Rdgq1uPgzVxk4/e6tI/AwGhSvEJkLJIyVTQDLpAQ0oMf0k2fNKsmkl5kEl2YSS9JiS9IAS1/SVNZJDQHoKwgr+10hXWJbPIgZIMlCSdRJkt1m+A9RZpHjK25pfNfi/8w8PZkHQHo1ztQAAAABJRU5ErkJggg==

23. **Start a chat with us**
   - Source: https://www.mangomint.com/static/19c674dff2afe2804ca05e52a5b8744c/e4a6b/chat-icon.png

24. **Untitled image**
   - Source: https://bat.bing.com/action/0?ti=97065788&Ver=2&mid=aebdde67-b8f9-40bb-8406-76444ea7b554&bo=1&sid=6470ad60aad411f0a08c3337922d37be&vid=6470f430aad411f0ad3dbbd763893d96&vids=0&msclkid=N&pi=0&lg=en-US&sw=1920&sh=1080&sc=24&tl=Flow%20Message%20Types%20%7C%20Mangomint%20Salon%20and%20Spa%20Software&p=https%3A%2F%2Fwww.mangomint.com%2Flearn%2Fflow-message-types%2F&r=&lt=426&evt=pageLoad&sv=2&cdb=AQAQ&rn=957515


## Analysis Notes
<!-- Add your analysis notes here -->

## Key Features Identified
<!-- List key features mentioned in this article -->

## Competitor Insights
<!-- Note what this reveals about Mango Mint's capabilities -->

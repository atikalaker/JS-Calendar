# JS Calendar
Javascript calendar plugin for your websites

In order to use this library you will have to include my [XDate](https://github.com/atikalaker/XDate/tree/master/Javascript) class in your project too.
The process is really straight forward. You will need to provide a **div** tag to create the Calendar inside it. and include the css and javascript files.
So your HTML will be something like this.

```HTML
<head>
    ...
    <link rel="stylesheet" type="text/css" href="calendar.min.css">
</head>
<body>
    ...
    <div id="calendar"><div>
    ...
    <script type="text/javascript" src="XDate.js"></script>
    <script type="text/javascript" src="calendar.js"></script>
    <script type="text/javascript">
        // USAGE SCRIPT GOES HERE
    </script>
</body>
```

Now we are ready to dive into the library usage. You will have a function named **Calendar** that you should give it some options to do the job.
Here is how you can use it.

```javascript
Calendar({
    elem: document.querySelector("#calendar"),

    primaryContext: "persian",
    secondaryContext: "gregorian",
    tertiaryContext: "hijri",

    weekDayFormat: "short",

    lang: "fa",

    onselect: function(date) {
        alert(`${date.year}/${date.month}/${date.day}`);
    }
});
```
## Calendar Options
### elem *[Required]*
This parameter will be the element that you want to create the calendar inside it. So you need to pass a DOMNode to this one

### primaryContext *[Required]*
This is the primary context of the calendar. This will specify the calendar that you want to create. There are 3 available context by now as you can see below. The context value can be one of these:

- gregorian
- persian
- hijri

### secondaryContext *[Optional]*
### tertiaryContext *[Optional]*
You can add two more calendar context next to the primary context as *secondaryContext* and *tertiaryContext*. Their values can be one of the values in the above list. This will show the corresponding dates of each day of the primary calendar context.

### weekDayFormat *[Optional]*
In the calendar header we always show week day names. Using this parameter you can specify how you want them to be displayed. There are 3 available formats that you can use for this purpose:

- full
- abbr
- short

**full** format will show week days like: Saturday, Sunday, etc...
**abbr** format will show the abbreviation of the week day like: Sat, Sun, etc...
**short** format will show a single letter for each week day like: S, S, M, T, etc...

### lang *[Optional]*
Using this parameter you can change the language for global texts, like button titles, ...

### onselect *[Optional]*
This last parameter is a callback function to handle date selected by your user. This will return a date object containing 3 values:

```javascript
{
    year: 2019,
    month: 2,
    day: 14
}
```
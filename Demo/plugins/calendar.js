function Calendar(options) {
    var defaults = {
        elem: null,
        primaryContext: "gregorian",
        secondaryContext: null,
        tertiaryContext: null,
        weekDayFormat: "short",
        lang: "en",
        onselect: null
    };
    var opts = { ...defaults, ...options };

    // Validate Options
    if (opts.elem == null) throw "Element is not defined in options";
    if (opts.primaryContext == null) throw "Primary Context is not defined in options";
    if (opts.weekDayFormat == null) throw "Week Day Format is not defined in options";

    function generateMonthDaysArray(year, month) {
        // Calculate previous Month & Year
        var prevYear = year, prevMonth = month - 1;
        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear = year - 1;
        }

        // Create XDate for Previous & Current months and convert them to the primary context
        var pd = new XDate(prevYear, prevMonth, 1, opts.primaryContext).toContext();
        var cd = new XDate(year, month, 1, opts.primaryContext).toContext();

        // Create the date for the first day in the calendar table
        var axd = new XDate(pd.year, pd.month, pd.lastDayInMonth - cd.weekDay + 1, opts.primaryContext);

        // If a secondary date is needed, Get three corresponding months data for the secondary date
        if (opts.secondaryContext) {
            var saxd = axd.convertContext(opts.secondaryContext, true);
            var secAD = saxd.toContext()
            var secBD = saxd.offsetMonths(1).offsetDays(-secAD.day + 1).toContext();
            var secCD = saxd.offsetMonths(1).toContext();

            var secArr = [];
            for (var i = secAD.day; i <= secAD.lastDayInMonth; i++) secArr.push({day: i, month: secAD.month, year: secAD.year});
            for (var i = secBD.day; i <= secBD.lastDayInMonth; i++) secArr.push({day: i, month: secBD.month, year: secBD.year});
            for (var i = secCD.day; i <= secCD.lastDayInMonth; i++) secArr.push({day: i, month: secCD.month, year: secCD.year});
            secArr.reverse();
        }

        // If a tertiary date is needed, Get three corresponding months data for the tertiary date
        if (opts.tertiaryContext) {
            var taxd = axd.convertContext(opts.tertiaryContext, true);
            var terAD = taxd.toContext()
            var terBD = taxd.offsetMonths(1).offsetDays(-terAD.day + 1).toContext();
            var terCD = taxd.offsetMonths(1).toContext();

            var terArr = [];
            for (var i = terAD.day; i <= terAD.lastDayInMonth; i++) terArr.push({day: i, month: terAD.month, year: terAD.year});
            for (var i = terBD.day; i <= terBD.lastDayInMonth; i++) terArr.push({day: i, month: terBD.month, year: terBD.year});
            for (var i = terCD.day; i <= terCD.lastDayInMonth; i++) terArr.push({day: i, month: terCD.month, year: terCD.year});
            terArr.reverse();
        }

        var days = [];

        // Insert the days before this month into the array as disabled days
        var c = 0;
        for (var i = cd.weekDay - 1; i >= 0; i--, c++)
            days.push({
                primary: pd.lastDayInMonth - i,
                secondary: secArr ? secArr.pop().day : null,
                tertiary: terArr ? terArr.pop().day : null,
                disabled: true
            });
        
        // Insert this month days into the array
        var ss = null, se = null, ts = null, te = null;
        for (var i = 1; i <= cd.lastDayInMonth; i++, c++) {
            // Get secondary and tertiary
            var sec = secArr ? secArr.pop() : null;
            var ter = terArr ? terArr.pop() : null;

            // Save secondary and tertiary start and ends on the first and last days of this month
            if (i == 1) { ss = sec; ts = ter; }
            if (i == cd.lastDayInMonth) { se = sec; te = ter; }

            days.push({
                primary: i,
                secondary: sec ? sec.day : null,
                tertiary: ter ? ter.day : null
            });

            // If this is the current date, mark it as current
            var now = new XDate().toContext(opts.primaryContext);
            if (year == now.year && month == now.month && i == now.day) days[days.length - 1].current = true;
        }

        // Fill the array until it fills the last row
        var i = 1;
        var tc = c > 35 ? 42 : 35;
        while (c++ < tc)
            days.push({
                primary: i++,
                secondary: secArr ? secArr.pop().day : null,
                tertiary: terArr ? terArr.pop().day : null,
                disabled: true
            });

        // Add metadata for the secondary and tertiary contexts
        days.push({ secondary: secArr ? [ss,se] : null, tertiary: terArr ? [ts, te] : null });
        
        // configure holidays
        var tmp = holidays[opts.primaryContext]
        for (var i = 0; i < days.length; i++) {
            var t = 1 << (i % 7);

            days[i].holiday = (tmp & t) != 0;
        }

        // Return days data
        return days;
    }

    function InitializeCalendar() {
        // Add a calendar class to the element
        cal.classList.add("calendar");

        // Add required HTML into the element
        cal.innerHTML = `<div class='header'>
            <div class='controls prev'>
                    <button class='btn year' title='${ strings[opts.lang].prevYear }'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'><path fill='inherit' d='M363.8 264.5L217 412.5c-4.7 4.7-12.3 4.7-17 0l-19.8-19.8c-4.7-4.7-4.7-12.3 0-17L298.7 256 180.2 136.3c-4.7-4.7-4.7-12.3 0-17L200 99.5c4.7-4.7 12.3-4.7 17 0l146.8 148c4.7 4.7 4.7 12.3 0 17zm-160-17L57 99.5c-4.7-4.7-12.3-4.7-17 0l-19.8 19.8c-4.7 4.7-4.7 12.3 0 17L138.7 256 20.2 375.7c-4.7 4.7-4.7 12.3 0 17L40 412.5c4.7 4.7 12.3 4.7 17 0l146.8-148c4.7-4.7 4.7-12.3 0-17z' /></svg></button>
                    <button class='btn month' title='${ strings[opts.lang].prevMonth }'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 512'><path fill='inherit' d='M187.8 264.5L41 412.5c-4.7 4.7-12.3 4.7-17 0L4.2 392.7c-4.7-4.7-4.7-12.3 0-17L122.7 256 4.2 136.3c-4.7-4.7-4.7-12.3 0-17L24 99.5c4.7-4.7 12.3-4.7 17 0l146.8 148c4.7 4.7 4.7 12.3 0 17z' /></svg></button>
                </div>
                <div class='info'></div>
                <div class='controls next'>
                    <button class='btn month' title='${ strings[opts.lang].nextMonth }'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 512'><path fill='inherit' d='M187.8 264.5L41 412.5c-4.7 4.7-12.3 4.7-17 0L4.2 392.7c-4.7-4.7-4.7-12.3 0-17L122.7 256 4.2 136.3c-4.7-4.7-4.7-12.3 0-17L24 99.5c4.7-4.7 12.3-4.7 17 0l146.8 148c4.7 4.7 4.7 12.3 0 17z' /></svg></button>
                    <button class='btn year' title='${ strings[opts.lang].nextYear }'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'><path fill='inherit' d='M363.8 264.5L217 412.5c-4.7 4.7-12.3 4.7-17 0l-19.8-19.8c-4.7-4.7-4.7-12.3 0-17L298.7 256 180.2 136.3c-4.7-4.7-4.7-12.3 0-17L200 99.5c4.7-4.7 12.3-4.7 17 0l146.8 148c4.7 4.7 4.7 12.3 0 17zm-160-17L57 99.5c-4.7-4.7-12.3-4.7-17 0l-19.8 19.8c-4.7 4.7-4.7 12.3 0 17L138.7 256 20.2 375.7c-4.7 4.7-4.7 12.3 0 17L40 412.5c4.7 4.7 12.3 4.7 17 0l146.8-148c4.7-4.7 4.7-12.3 0-17z' /></svg></button>
                </div>
            </div>
            <div class='weekdays'>
                ${ weekdays[opts.primaryContext].map((wd, i) => `<div class='weekday${ holidays[opts.primaryContext] & (1 << i) ? " holiday" : ""}'>${wd[opts.weekDayFormat]}</div>` ).join("") }
            </div>
                
            <div class='days'></div>`;

            
        // Add click events for buttons on header, to navigate through months and years
        cal.querySelector(".controls.next .year").addEventListener("click", function() {
            if (cd.year < 3178) {
                cd.year += 1;

                updateCalendar(generateMonthDaysArray(cd.year, cd.month));
            }
        });
        cal.querySelector(".controls.prev .year").addEventListener("click", function() {
            if (cd.year > 1) {
                cd.year -= 1;

                updateCalendar(generateMonthDaysArray(cd.year, cd.month));
            }
        });
        cal.querySelector(".controls.next .month").addEventListener("click", function() {
            if (cd.year < 3178 && cd.month) {
                cd.month += 1;
                if (cd.month > 12) {
                    cd.year += 1;
                    cd.month = 1;
                }

                updateCalendar(generateMonthDaysArray(cd.year, cd.month));
            }
        });
        cal.querySelector(".controls.prev .month").addEventListener("click", function() {
            if (cd.year > 1) {
                cd.month -= 1;
                if (cd.month < 1) {
                    cd.year -= 1;
                    cd.month = 12;
                }

                updateCalendar(generateMonthDaysArray(cd.year, cd.month));
            }
        });
    }

    function updateCalendar(data) {
        // Get the metadata
        var meta = data.pop();

        // Convert days data into HTML and add it into the days div
        days.innerHTML = data.map(day => `<div ${day.disabled ? "" : `data-day='${day.primary}'`} class='day${ day.disabled ? " disabled" : ""}${ day.current ? " current" : ""}${ day.holiday ? " holiday" : ""}'>
                                            <span class='primary'>${ convertNums(day.primary.toString(), opts.primaryContext) }</span>
                                            ${ opts.secondaryContext ? `<span class='secondary'>${ convertNums(day.secondary.toString(), opts.secondaryContext) }</span>` : "" }
                                            ${ opts.tertiaryContext ? `<span class='tertiary'>${ convertNums(day.tertiary.toString(), opts.tertiaryContext) }</span>` : "" }
                                        </div>`).join("");

        // Add click event to all enabled days, if a handler method is provided
        if (opts.onselect != null) {
            days.querySelectorAll(".day:not(.disabled)").forEach(day => {
                day.onclick = function() {
                    opts.onselect({
                        year: cd.year,
                        month: cd.month,
                        day: parseInt(this.getAttribute("data-day"))
                    });
                }
            });
        }

        // Generate the primary month and year
        var html = `<div class='primary'>
            <span class='label'>${ convertNums(cd.year.toString(), opts.primaryContext) }</span>
            <span class='label'>${ months[opts.primaryContext][cd.month - 1] }</span>
        </div>`;
        
        // Generate the secondary month and year
        if (opts.secondaryContext) {
            html += `<div class='secondary'>
                    <span class='label'>${months[opts.secondaryContext][meta.secondary[0].month - 1]} ${ convertNums((meta.secondary[0].year != meta.secondary[1].year ? meta.secondary[0].year : "").toString(), opts.secondaryContext) }</span> - 
                    <span class='label'>${months[opts.secondaryContext][meta.secondary[1].month - 1]} ${ convertNums((meta.secondary[1].year).toString(), opts.secondaryContext) }</span>
                </div>`;
        }

        // Generate the tertiary month and year
        if (opts.tertiaryContext) {
            html += `<div class='tertiary'>
                <span class='label'>${months[opts.tertiaryContext][meta.tertiary[0].month - 1]} ${ convertNums((meta.tertiary[0].year != meta.tertiary[1].year ? meta.tertiary[0].year : "").toString(), opts.tertiaryContext) }</span> - 
                <span class='label'>${months[opts.tertiaryContext][meta.tertiary[1].month - 1]} ${ convertNums((meta.tertiary[1].year).toString(), opts.tertiaryContext) }</span>
            </div>`;
        }

        // Update header HTML
        header.innerHTML = html;
    }

    // Month names
    var months = { 
        gregorian: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        persian: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
        hijri: ["محرم", "صفر", "ربیع الاول", "ربيع الثاني", "جمادي الاولي", "جمادي الثانيه", "رجب", "شعبان", "رمضان", "شوال", "ذوالقعده", "ذوالحجه"]
    };

    // Weekday Names
    var weekdays = { 
        gregorian: [
            { full: "Sunday", abbr: "Sun", short: "S" },
            { full: "Monday", abbr: "Mon", short: "M" },
            { full: "Tuesday", abbr: "Tue", short: "T" },
            { full: "Wednesday", abbr: "Wed", short: "W" },
            { full: "Thursday", abbr: "Thu", short: "T" },
            { full: "Friday", abbr: "Fri", short: "F" },
            { full: "Saturday", abbr: "Sat", short: "S" }
        ],
        persian: [
            { full: "شنبه", abbr: "شنبه", short: "ش" },
            { full: "یکشنبه", abbr: "یکشنبه", short: "ی" },
            { full: "دوشنبه", abbr: "دوشنبه", short: "د" },
            { full: "سه شنبه", abbr: "سه شنبه", short: "س" },
            { full: "چهارشنبه", abbr: "چهارشنبه", short: "چ" },
            { full: "پنجشنبه", abbr: "پنجشنبه", short: "پ" },
            { full: "جمعه", abbr: "جمعه", short: "ج" }
        ],
        hijri: [
            { full: "السبت", abbr: "السبت", short: "السبت" },
            { full: "الأحد", abbr: "الأحد", short: "الأحد" },
            { full: "الإثنين", abbr: "الإثنين", short: "الإثنين" },
            { full: "الثلاثاء", abbr: "الثلاثاء", short: "الثلاثاء" },
            { full: "الأربعاء", abbr: "الأربعاء", short: "الأربعاء" },
            { full: "الخميس", abbr: "الخميس", short: "الخميس" },
            { full: "الجمعة", abbr: "الجمعة", short: "الجمعة" }
        ]
    };

    // This is for converting digits to the context
    function convertNums(str, context) {
        let anums = "۰۱۲۳۴۵۶۷۸۹";
        var enums = "0123456789";

        if (["persian", "hijri"].includes(context)) {
            for (var i = 0; i < enums.length; i++)
                str = str.replace(new RegExp(enums[i], 'g'), anums[i]);
        } else if (["gregorian"].includes(context)) {
            for (var i = 0; i < anums.length; i++)
                str = str.replace(new RegExp(anums[i], 'g'), enums[i]);
        }

        return str;
    }

    var strings = {
        en: {
            nextYear: "Next year",
            prevYear: "Previous year",
            nextMonth: "Next month",
            prevMonth: "Previous month"
        },
        fa: {
            nextYear: "سال بعد",
            prevYear: "سال قبل",
            nextMonth: "ماه بعد",
            prevMonth: "ماه قبل"
        },
        ar: {
            nextYear: "السنة القادم",
            prevYear: "السنة الماضية",
            nextMonth: "الشهر القادم",
            prevMonth: "الشهر الماضى"
        }
    }

    // Holiday week names
    var holidays = { 
        gregorian: 0b1000001,
        persian: 0b1000000,
        hijri: 0b1000000
    };

    // Get the current date as the base date of the calendar
    var cd = new XDate().toContext(opts.primaryContext);

    // Initialize the calendar element
    var cal = opts.elem;
    InitializeCalendar();
    var days = cal.querySelector(".days");
    var header = cal.querySelector(".header .info");

    // Update the calendar with the current data
    updateCalendar(generateMonthDaysArray(cd.year, cd.month));
}
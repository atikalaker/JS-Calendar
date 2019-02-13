class XDate {
    // General Constructor
    constructor(a, b, c, d) {
        // Set default context
        this.context = "gregorian";

        // If no parameters were given
        if (a === undefined) {
            // Create a new date
            a = new Date;

            // Get new date data as the input data
            this.day = a.getDate();
            this.month = a.getMonth() + 1;
            this.year = a.getFullYear();
            
            // Generate julian day number
            this.generateJulianDayNumber();
        
        // If only a date was give
        } else if (a instanceof Date && c === undefined && d === undefined) {
            // If the second parameter was a string
            if (b !== undefined && typeof b == "string") {
                // Use that as the context
                this.context = b;

                // Check if the context is a valid context
                if (!["gregorian","persian","hijri"].includes(this.context)) {
                    throw `Invalid context '${this.context}'`;
                }
            }

            // Get date parameters
            this.day = a.getDate();
            this.month = a.getMonth() + 1;
            this.year = a.getFullYear();

            // Generate julian day number
            this.generateJulianDayNumber();
        
        // If a number was given
        } else if (typeof a == "number" && c === undefined && d === undefined) {
            // If the second parameter was a string
            if (b !== undefined && typeof b == "string") {
                // Use that as the context
                this.context = b;

                // Check if the context is a valid context
                if (!["gregorian","persian","hijri"].includes(this.context)) {
                    throw `Invalid context '${this.context}'`;
                }
            }

            // Use the first number paramter as julian day number
            this.jdn = a;

            // Convert the jdn to the current context and get date parameters
            var date = this.toContext();
            this.year = date.year;
            this.month = date.month;
            this.day = date.day;
        
        // If all parameters were given
        } else if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
            // Check if the last parameter is a valid context
            if (!["gregorian","persian","hijri"].includes(d)) {
                throw `Invalid context '${d}'`;
            }

            // Set the parameters to date paramters
            this.year = a;
            this.month = b;
            this.day = c;
            this.context = d;
    
            // Generate julian day number
            this.generateJulianDayNumber();

        // Otherwise it is an invalid parameter case
        } else {
            throw `Invalid parameters`;
        }
    }


    // Create a clone of this class
    clone() {
        return new XDate(this.jdn, this.context);
    }


    // Generates a new julian day number from the current date parameters
    generateJulianDayNumber() {
        if (this.context == "gregorian") {
            this.jdn = this.g2d(this.year, this.month, this.day);
        } else if (this.context == "persian") {
            this.jdn = this.p2d(this.year, this.month, this.day);
        } else if (this.context == "hijri") {
            this.jdn = this.h2d(this.year, this.month, this.day);
        }
    }

    // This will return the day of week based on julian day number
    dayOfWeek(fix = 1) {
        return Math.floor(this.mod(this.jdn + fix, 7));
    }


    // Converts the context to a new context
    convertContext(context, createClone = false) {
        // Check to ensure a context is given
        if (context === undefined) throw "Invalid Context";

        // Get date paramters in a new context
        var date = this.toContext(context);

        // If should create a clone
        if (createClone) {
            // Create a new XDate with new date parameters
            return new XDate(date.year, date.month, date.day, context);
        } else {
            // Update date parameters
            this.year = date.year;
            this.month = date.month;
            this.day = date.day;
            this.context = context;

            return this;
        }
    }
    // Get date parameters in a new context
    toContext(context) {
        // If no context was given, use current context
        if (context === undefined) context = this.context;
        
        if (context == "gregorian") {
            return this.d2g(this.jdn);
        } else if (context == "persian") {
            return this.d2p(this.jdn);
        } else if (context == "hijri") {
            return this.d2h(this.jdn);
        }
    }


    // Offset by day
    offsetDays(days, createClone = false) {
        // If should create a clone
        if (createClone) {
            // Create a new XDate with adding days to julian day number
            return new XDate(this.jdn + days, this.context);
        } else {
            // Add days to the julian day number
            this.jdn += days;

            // Recreate the date parameters in this context
            var date = this.toContext();
            this.year = date.year;
            this.month = date.month;
            this.day = date.day;

            return this;
        }
    }
    // Offset by month
    offsetMonths(months, createClone = false) {
        // Get current year and month
        var year = this.year, month = this.month;

        // if months is not 0
        if (months != 0) {
            // If months amount is greater than a year
            if (months >= 12 || months <= -12) {
                // Add years amount of this months to the years parameters
                year += (months < 0 ? Math.ceil : Math.floor)(months / 12);

                // Add remaining months to the month
                month += months % 12;
            } else {
                // Add months to the months of this year
                month += months;
            }

            // If the month is less than 1 or greater than 12, fix the year
            if (month < 1) {
                month = 12 - month;
                year--;
            } else if (month > 12) {
                month = month - 12;
                year++;
            }
        }

        // If should create a clone
        if (createClone) {
            // Create a new XDate with new date parameters
            return new XDate(year, month, this.day, this.context);
        } else {
            // Update date parameters
            this.year = year;
            this.month = month;

            // Generate julian day number
            this.generateJulianDayNumber();
            
            return this;
        }
    }
    // Offset by year
    offsetYears(years, createClone = false) {
        // Add years to the year parameter
        var year = this.year + years;

        // If should create clone
        if (createClone) {
            // Create a new XDate with new date parameters
            return new XDate(year, this.month, this.day, this.context);
        } else {
            // Update date parameters
            this.year = year;

            // Generate julian day number
            this.generateJulianDayNumber();

            return this;
        }
    }


    // These 3 Methods are similar to "toContext" method, but with their context name [Less generic]
    toPersian() {
        return this.d2p(this.jdn);
    }
    toGregorian() {
        return this.d2g(this.jdn);
    }
    toHijri() {
        return this.d2h(this.jdn);
    }

    // This will return the julian day number
    toJulian() {
        return this.jdn;
    }


    // Create a persian calendar to consider leap years
    persianCal(jy) {
        var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178],
            bl = breaks.length,
            gy = jy + 621,
            leapJ = -14,
            jp = breaks[0],
            jm, jump, leap, leapG, march, n, i
        if (jy < jp || jy >= breaks[bl - 1]) throw new Error('Invalid Persian year ' + jy);
        for (i = 1; i < bl; i += 1) {
            jm = breaks[i];
            jump = jm - jp;
            if (jy < jm) break;
            leapJ = leapJ + this.div(jump, 33) * 8 + this.div(this.mod(jump, 33), 4);
            jp = jm;
        }
        n = jy - jp;
        leapJ = leapJ + this.div(n, 33) * 8 + this.div(this.mod(n, 33) + 3, 4);
        if (this.mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
        leapG = this.div(gy, 4) - this.div((this.div(gy, 100) + 1) * 3, 4) - 150;
        march = 20 + leapJ - leapG;
        if (jump - n < 6) n = n - jump + this.div(jump + 4, 33) * 33;
        leap = this.mod(this.mod(n + 1, 33) - 1, 4);
        if (leap === -1) leap = 4;
        return {
            leap: leap,
            gy: gy,
            march: march
        }
    }
    // Convert perisan date to julian day number
    p2d(jy, jm, jd) {
        var r = this.persianCal(jy);
        return this.g2d(r.gy, 3, r.march) + (jm - 1) * 31 - this.div(jm, 7) * (jm - 7) + jd - 1;
    }
    // Convert julian day number to persian date
    d2p(jdn) {
        var gy = this.d2g(jdn).year,
            year = gy - 621,
            r = this.persianCal(year),
            jdn1f = this.g2d(gy, 3, r.march),
            day, month, k
        k = jdn - jdn1f;
        var dms = [ 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, r.leap === 1 ? 30 : 29 ];
        if (k >= 0) {
            if (k <= 185) {
                month = 1 + this.div(k, 31);
                day = this.mod(k, 31) + 1;
                return { year, month, day, weekDay: this.dayOfWeek(2), lastDayInMonth: dms[month - 1] };
            } else {
                k -= 186;
            }
        } else {
            year -= 1;
            k += 179;
            if (r.leap === 1) k += 1;
        }
        month = 7 + this.div(k, 30);
        day = this.mod(k, 30) + 1;
        return { year, month, day, weekDay: this.dayOfWeek(2), lastDayInMonth: dms[month - 1] };
    }


    // Convert gregorian date to julian day number
    g2d(gy, gm, gd) {
        var d = this.div((gy + this.div(gm - 8, 6) + 100100) * 1461, 4) + this.div(153 * this.mod(gm + 9, 12) + 2, 5) + gd - 34840408;
        d = d - this.div(this.div(gy + 100100 + this.div(gm - 8, 6), 100) * 3, 4) + 752;
        return d;
    }
    // Convert julian day number to gregorian date
    d2g(jdn) {
        var j, i, day, month, year;
        j = 4 * jdn + 139361631;
        j = j + this.div(this.div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
        i = this.div(this.mod(j, 1461), 4) * 5 + 308;
        day = this.div(this.mod(i, 153), 5) + 1;
        month = this.mod(this.div(i, 153), 12) + 1;
        year = this.div(j, 1461) - 100100 + this.div(8 - month, 6);
        var isLeapYear = year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
        var dms = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return { year, month, day, weekDay: this.dayOfWeek(), lastDayInMonth: dms[month - 1] };
    }


    // Convert hijri date to julian day number
    h2d(year, month, day) {
        var epoch = 1948439.5;
        return (day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.trunc((3 + (11 * year)) / 30) + epoch) - 1;
    }
    // Convert julian day number to hijri date
    d2h(jdn) {
        var epoch = 1948439.5;

        jdn = Math.trunc(jdn) + 0.5;
        var year = Math.trunc(((30 * (jdn - epoch)) + 10646) / 10631);
        var month = Math.min(12, Math.ceil((jdn - (29 + this.h2d(year, 1, 1))) / 29.5) + 1);
        var day = parseInt(jdn - this.h2d(year, month, 1)) + 1;

        var isLeap = [2,5,7,10,13,16,18,21,24,26,29].includes(year % 30);
        var lastDay = [1,3,5,7,9,11].includes(month) || (month == 12 && isLeap) ? 30 : 29;

        return { year, month, day, weekDay: this.dayOfWeek(), lastDayInMonth: lastDay };
    }


    // Asset functions for date calculations
    div(a, b) {
        return ~~(a / b);
    }
    mod(a, b) {
        return a - ~~(a / b) * b;
    }    
}
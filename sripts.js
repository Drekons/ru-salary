function money(sum) {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(sum)
}

const step1 = 2400000;
const step2 = 5000000;
const monthes = {
    0: 'Январь',
    1: 'Февраль',
    2: 'Март',
    3: 'Апрель',
    4: 'Май',
    5: 'Июнь',
    6: 'Июль',
    7: 'Август',
    8: 'Сентябрь',
    9: 'Октябрь',
    10: 'Ноябрь',
    11: 'Декабрь',
};

$(function () {
    $('#salary').on('input', function () {
        $('#salary-table').remove()
        if ($(this).val() <= 0) {
            return
        }

        $table = $('<table id="salary-table" class="table table-striped table-bordered"></table>')
        $table.append('<thead><tr><th>Месяц</th><th>ЗП до 2025 года</th><th>Сумма до 2025</th>' +
            '<th>ЗП после 2025 года</th><th>Сумма после 2025 года</th></tr></thead>')
        $table.append('<tbody></tbody>')

        let oklad = parseInt($(this).val());
        let totalClear = 0;
        let total = 0;
        let totalOld = 0;


        for (let i = 0; i < 12; i++) {
            let month = oklad - oklad * 0.13;
            let monthOld = month;
            switch (true) {
                case totalClear + oklad > step2: // выше 5
                    if (totalClear > step2) {
                        month = oklad - oklad * 0.18;
                        monthOld = oklad - oklad * 0.15;
                    } else {
                        let morePath = totalClear + oklad - step2;
                        let lessPath = oklad - morePath;
                        month = lessPath - lessPath * 0.15;
                        month += morePath - morePath * 0.18;
                        monthOld = lessPath - lessPath * 0.13;
                        monthOld += morePath - morePath * 0.15;
                    }
                    break;
                case totalClear + oklad > step1: // выше 2,5
                    if (totalClear > step1) {
                        month = oklad - oklad * 0.15;
                    } else {
                        let morePath = totalClear + oklad - step1;
                        let lessPath = oklad - morePath;
                        month = lessPath - lessPath * 0.13;
                        month += morePath - morePath * 0.15;
                    }
                    break;
                default:
                    break;
            }

            totalClear += oklad;
            totalOld += monthOld;
            total += month;

            $table.find('tbody').append(
                $('<tr>').append(
                    $('<td>').text(monthes[i]),
                    $('<td>').text(money(monthOld)),
                    $('<td>').text(money(totalOld)),
                    $('<td>').text(money(month)),
                    $('<td>').text(money(total))
                )
            );
        }

        $table.append($('<tfoot>').append(
            $('<tr>').append(
                $('<th>').text('Средняя за год (до 2025):'),
                $('<th>').text(money(totalOld/12)),
                $('<th>'),
                $('<th>').text('Средняя за год (после 2025):'),
                $('<th>').text(money(total/12)),
            )
        ))

        $('#salary-form').after($table)
    })
});
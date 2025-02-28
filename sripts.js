function money(sum) {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(sum)
}

const step1 = 2400000; // 2.4 млн руб
const step2 = 5000000; // 5 млн руб
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
    const salaryInput = new Cleave('#salary', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        delimiter: ' '
    });

    const bonusInput = new Cleave('#bonus-amount', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        delimiter: ' '
    });
    $('#salary, #bonus-amount').on('input', function () {
        $('#salary-table').remove()
        const salaryValue = salaryInput.getRawValue();
        const bonusValue = bonusInput.getRawValue();

        if (!salaryValue || salaryValue <= 0) {
            return;
        }

        $table = $('<table id="salary-table" class="table table-striped table-bordered"></table>')
        $table.append('<thead><tr><th>Месяц</th><th>ЗП до 2025 года</th><th>Сумма до 2025</th>' +
            '<th>ЗП после 2025 года</th><th>Сумма после 2025 года</th></tr></thead>')
        $table.append('<tbody></tbody>')

        let oklad = parseInt(salaryValue) || 0;
        let bonusAmount = parseInt(bonusValue) || 0;

        let totalGross = 0; // Общий доход до налогов
        let totalNetOld = 0; // Общий доход после налогов (до 2025)
        let totalNetNew = 0; // Общий доход после налогов (после 2025)

        for (let i = 0; i < 12; i++) {
            // Учитываем премию в указанном месяце
            let monthlyIncome = oklad + bonusAmount;

            totalGross += monthlyIncome;
            
            // Расчет налога до 2025 года (13% до 5 млн, 15% свыше)
            let taxOld = 0;
            if (totalGross <= step2) {
                taxOld = monthlyIncome * 0.13;
            } else {
                // Если часть текущей зарплаты попадает в диапазон выше 5 млн
                if (totalGross - monthlyIncome < step2) {
                    let belowThreshold = step2 - (totalGross - monthlyIncome);
                    let aboveThreshold = monthlyIncome - belowThreshold;
                    taxOld = belowThreshold * 0.13 + aboveThreshold * 0.15;
                } else {
                    // Вся текущая зарплата выше порога в 5 млн
                    taxOld = monthlyIncome * 0.15;
                }
            }
            
            // Расчет налога после 2025 года (13% до 2.4 млн, 15% до 5 млн, 18% свыше)
            let taxNew = 0;
            if (totalGross <= step1) {
                taxNew = monthlyIncome * 0.13;
            } else if (totalGross <= step2) {
                // Если часть текущей зарплаты попадает в диапазон от 2.4 до 5 млн
                if (totalGross - monthlyIncome < step1) {
                    let belowStep1 = step1 - (totalGross - monthlyIncome);
                    let betweenSteps = monthlyIncome - belowStep1;
                    taxNew = belowStep1 * 0.13 + betweenSteps * 0.15;
                } else {
                    // Вся текущая зарплата в диапазоне от 2.4 до 5 млн
                    taxNew = monthlyIncome * 0.15;
                }
            } else {
                // Если часть текущей зарплаты попадает в диапазон выше 5 млн
                if (totalGross - monthlyIncome < step2) {
                    if (totalGross - monthlyIncome < step1) {
                        // Зарплата распределяется по всем трем диапазонам
                        let belowStep1 = step1 - (totalGross - monthlyIncome);
                        let betweenSteps = Math.min(step2 - step1, step2 - (totalGross - monthlyIncome) - belowStep1);
                        let aboveStep2 = monthlyIncome - belowStep1 - betweenSteps;
                        taxNew = belowStep1 * 0.13 + betweenSteps * 0.15 + aboveStep2 * 0.18;
                    } else {
                        // Зарплата распределяется между вторым и третьим диапазонами
                        let betweenSteps = step2 - (totalGross - monthlyIncome);
                        let aboveStep2 = monthlyIncome - betweenSteps;
                        taxNew = betweenSteps * 0.15 + aboveStep2 * 0.18;
                    }
                } else {
                    // Вся текущая зарплата выше порога в 5 млн
                    taxNew = monthlyIncome * 0.18;
                }
            }
            
            let monthNetOld = monthlyIncome - taxOld;
            let monthNetNew = monthlyIncome - taxNew;
            
            totalNetOld += monthNetOld;
            totalNetNew += monthNetNew;

            // Выделяем месяц с премией
            let rowClass = bonusAmount > 0 ? 'table-success' : '';

            $table.find('tbody').append(
                $('<tr>').addClass(rowClass).append(
                    $('<td>').text(monthes[i] + (bonusAmount > 0 ? ' (+ премия)' : '')),
                    $('<td>').text(money(monthNetOld)),
                    $('<td>').text(money(totalNetOld)),
                    $('<td>').text(money(monthNetNew)),
                    $('<td>').text(money(totalNetNew))
                )
            );
        }

        $table.append($('<tfoot>').append(
            $('<tr>').append(
                $('<th>').text('Средняя за год (до 2025):'),
                $('<th>').text(money(totalNetOld/12)),
                $('<th>').text('Средняя за год (после 2025):'),
                $('<th>').text(money(totalNetNew/12)),
                $('<th>'),
            )
        ))

        $('#salary-form').after($table)
    })
});
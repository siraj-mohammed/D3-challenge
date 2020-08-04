var svgWidth = 900;
var svgHeight = 600;

var margin = {
    top: 40,
    bottom: 90,
    right: 40,
    left: 100
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#plot")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params.
var selected_x = "poverty";
var selected_y = "healthcare";

// Function used for updating x-axis scale upon clicking the label.
function xScale(paperData, selected_x) {
    // Create Scales.
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(paperData, d => d[selected_x]) * .8,
        d3.max(paperData, d => d[selected_x]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// Function used for updating y-axis scale when clicking the label.
function yScale(paperData, selected_y) {
    // Create Scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(paperData, d => d[selected_y]) * .8,
        d3.max(paperData, d => d[selected_y]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// Function used for updating xAxis var upon clicking the label.
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating yAxis var upon clicking the label.
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

function demoDisplay(xaxis, yaxis) {
    targetID = "my_" + xaxis + "_" + yaxis;

    var postedOnes = getElementsByIdStartsWith("container", "div", "my_");
    for (i = 0; i < postedOnes.length; i++) { document.getElementById(postedOnes[i]).style.display = "none"; }

    document.getElementById(targetID).style.display = "block";
}

function getElementsByIdStartsWith(container, selectorTag, prefix) {
    var items = [];
    var myPosts = document.getElementById(container).getElementsByTagName(selectorTag);
    for (var i = 0; i < myPosts.length; i++) {
        if (myPosts[i].id.lastIndexOf(prefix, 0) === 0) {
            items.push($(myPosts[i].outerHTML).attr("id"));
        }
    }
    return items;
}

// Function used for updating circles group with a transition to new circles.
function renderCircles(circlesGroup, newXScale, newYScale, selected_x, selected_y) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[selected_x]))
        .attr("cy", d => newYScale(d[selected_y]));

    return circlesGroup;
}

// Function used for updating text in circles group with a transition to new text.
function renderText(circletextGroup, newXScale, newYScale, selected_x, selected_y) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[selected_x]))
        .attr("y", d => newYScale(d[selected_y]));

    return circletextGroup;
}

// Function used for updating circles group with new tooltip.
function updateToolTip(selected_x, selected_y, circlesGroup) {
    var xlabel = "";
    var ylabel = "";
    // Conditional for X Axis.
    if (selected_x === "poverty") {
        xlabel = "Poverty: ";
    }
    else if (selected_x === "income") {
        xlabel = "Median Income: ";
    }
    else {
        xlabel = "Age: ";
    }

    // Conditional for Y Axis.
    if (selected_y === "healthcare") {
        ylabel = "Lacks Healthcare: ";
    }
    else if (selected_y === "smokes") {
        ylabel = "Smokers: ";
    }
    else {
        ylabel = "Obesity: ";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("background", "black")
        .style("color", "white")
        .offset([120, -60])
        .html(function (d) {
            if (selected_x === "age") {
                // All yAxis tooltip labels presented and formated as %.
                // Display Age without format for xAxis.
                return (`${d.state}<hr>${xlabel} ${d[selected_x]}<br>${ylabel}${d[selected_y]}%`);
            } else if (selected_x !== "poverty" && selected_x !== "age") {
                // Display Income in dollars for xAxis.
                return (`${d.state}<hr>${xlabel}$${d[selected_x]}<br>${ylabel}${d[selected_y]}%`);
            } else {
                // Display Poverty as percentage for xAxis.
                return (`${d.state}<hr>${xlabel}${d[selected_x]}%<br>${ylabel}${d[selected_y]}%`);
            }
        });

    circlesGroup.call(toolTip);

    // Create "mouseover" event listener to display tool tip.
    circlesGroup
        .on("mouseover", function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 18)
                .attr("fill", "cyan");
        })
        .on("click", function (data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 15)
                .attr("fill", "blue");
            toolTip.hide();
        });

    return circlesGroup;
}

// Import data.
d3.csv("assets/data/data.csv")
    .then(function (paperData) {

        // Parse/Cast as numbers
        paperData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.smokes = +data.smokes;
            data.obesity = +data.obesity;
            // console.log(data);
        });

        // Create x scale function.
        // xLinearScale function above csv import.
        var xLinearScale = xScale(paperData, selected_x);

        // Create y scale function.
        // yLinearScale function above csv import.
        var yLinearScale = yScale(paperData, selected_y);

        // Create axis functions.
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // Create circles.
        var circlesGroup = chartGroup.selectAll("circle")
            .data(paperData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[selected_x]))
            .attr("cy", d => yLinearScale(d[selected_y]))
            .attr("r", "15")
            .attr("fill", "blue")
            .attr("opacity", ".5");

        // Add State abbr. text to circles.
        var circletextGroup = chartGroup.selectAll()
            .data(paperData)
            .enter()
            .append("text")
            .text(d => (d.abbr))
            .attr("x", d => xLinearScale(d[selected_x]))
            .attr("y", d => yLinearScale(d[selected_y]))
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .style('fill', 'black');

        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener.
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener.
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener.
            .classed("inactive", true)
            .text("Household Income (Median)");

        var healthcareLabel = labelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", (margin.left) * 2.5)
            .attr("y", 0 - (height - 60))
            .attr("value", "healthcare") // value to grab for event listener.
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokeLabel = labelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", (margin.left) * 2.5)
            .attr("y", 0 - (height - 40))
            .attr("value", "smokes") // value to grab for event listener.
            .classed("inactive", true)
            .text("Smokes (%)");

        var obesityLabel = labelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", (margin.left) * 2.5)
            .attr("y", 0 - (height - 20))
            .attr("value", "obesity") // value to grab for event listener.
            .classed("inactive", true)
            .text("Obesity (%)");

        // Update tool tip function above csv import.
        var circlesGroup = updateToolTip(selected_x, selected_y, circlesGroup);

        // X Axis labels event listener.
        labelsGroup.selectAll("text")
            .on("click", function () {
                // Get value of selection.
                var value = d3.select(this).attr("value");
                // console.log("changing selection !");
                if (true) {
                    if (value === "poverty" || value === "age" || value === "income") {

                        // Replaces selected_x with value.
                        selected_x = value;

                        // console.log(selected_x)

                        // Update x scale for new data.
                        xLinearScale = xScale(paperData, selected_x);

                        // Updates x axis with transition.
                        xAxis = renderXAxes(xLinearScale, xAxis);

                        // Changes classes to change bold text.
                        if (selected_x === "poverty") {
                            povertyLabel
                                .classed("active", true)
                                .classed("inactive", false);

                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }
                        else if (selected_x === "age") {
                            povertyLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            ageLabel
                                .classed("active", true)
                                .classed("inactive", false);

                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }
                        else {
                            povertyLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true)

                            incomeLabel
                                .classed("active", true)
                                .classed("inactive", false);
                        }

                    } else {

                        selected_y = value;

                        // Update y scale for new data.
                        yLinearScale = yScale(paperData, selected_y);

                        // Updates y axis with transition.
                        yAxis = renderYAxes(yLinearScale, yAxis);

                        // Changes classes to change bold text.
                        if (selected_y === "healthcare") {
                            healthcareLabel
                                .classed("active", true)
                                .classed("inactive", false);

                            smokeLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }
                        else if (selected_y === "smokes") {
                            healthcareLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            smokeLabel
                                .classed("active", true)
                                .classed("inactive", false);

                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }
                        else {
                            healthcareLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            smokeLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            obesityLabel
                                .classed("active", true)
                                .classed("inactive", false);
                        }

                    }
                    demoDisplay(selected_x, selected_y);
                    // Update circles with new x values.
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, selected_x, selected_y);

                    // Update tool tips with new info.
                    circlesGroup = updateToolTip(selected_x, selected_y, circlesGroup);

                    // Update circles text with new values.
                    circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, selected_x, selected_y);

                }
            });
    });
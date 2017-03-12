import EventEmitter from 'events';
import Snap from 'snap';
import $ from 'jquery';
import _ from 'underscore';

import Door from 'KozijnIsolatie/Widget/DrawElement/Door';

class KozijnIsolatieWidget extends EventEmitter {

    settings = {};
    svg = false;
    drawElements = [];
    widget = false;
    dragIconWrapper = false;
    drawElementTypes = {
        door: Door
    };
    groupingRects = {
        horizontalGroups: {},
        verticalGroups: {}
    };
    dragIcons = [];

    /**
     * @param settings.
     * @constructor
     */
    constructor (settings) {
        super();
        Object.assign(this.settings, settings);

        this.widget = $(settings.selector)
        .addClass('kozijnisolatie-widget')
        .append('<svg class="svg-canvas"></svg>');

        this.dragIconWrapper = $('<div class="drag-icons-wrapper"></div>');
        this.widget.append(this.dragIconWrapper);

        this.svg = Snap(settings.selector + ' svg');

        $(settings.selector + ' svg').on('dragover', function (event) {
            event.preventDefault();
        })
        .on('drop', (event) => {
            event.preventDefault();
            var drawElementTypeName = event.originalEvent.dataTransfer.getData('text');
            var newDrawElement = new this.drawElementTypes[drawElementTypeName]({
                widget: this
            });

            // If the drop is directly on this element and NOT on a child.
            if (event.target == this.svg.node) {
                newDrawElement.setPositionAndSizeByDropEvent(event.originalEvent);
            }
            else {
                var drawElementToDivide = event.target.drawElement;
                // TODO find a better way, this function divides itself and returns coordinates for the new object.
                var spaceToFill = drawElementToDivide.divideByDropEvent(newDrawElement, event.originalEvent);
                newDrawElement.setPositionAndSize(spaceToFill);
            }

            this.drawElements.push(newDrawElement);
            newDrawElement.render();
            this.createGroupingRects();
        });

        this.createDragIcons();
    }

    getFreeSpaceAroundXandY (x, y) {
        if (!this.drawElements.length) {
            return {
                x: 0,
                y: 0,
                width: $(this.svg.node).width(),
                height: $(this.svg.node).height()
            }
        }
    }

    createDragIcons () {
        _.forEach(this.drawElementTypes, (drawElementType) => {
            var drawElement = new drawElementType({
                widget: this
            });

            var dragIcon = $(drawElement.getDragIcon())
            .attr('draggable', true)
            .on('dragstart', (event) => {
                event.originalEvent.dataTransfer.setData('text/plain', drawElement.getType());
            });

            this.dragIcons.push(dragIcon);
            this.dragIconWrapper.append(dragIcon);
        });
    }

    createGroupingLines () {
      var lines = [];

      lines.addLine = function (x1, y1, x2, y2, drawElement)  {
          this.push({
              x1: x1,
              y1: y1,
              x2: x2,
              y2: y2,
              width: Math.abs(x2 - x1),
              height: Math.abs(y2 - y1),
              object: drawElement
          });
      };

      this.drawElements.forEach((dE) => {
          // TODO move these 2 declarations to drawElement itself:
          var x2 = dE.x + dE.width;
          var y2 = dE.y + dE.height;

          // Top line
          lines.addLine(dE.x, dE.y, x2, dE.y, dE);

          // Bottom line
          lines.addLine(dE.x, y2, x2, y2, dE);

          // Left line
          lines.addLine(dE.x, dE.y, dE.x, y2, dE);

          // Right line
          lines.addLine(x2, dE.y, x2, y2, dE);

      });

      return lines;
    }

    createGroups (lines, orientation) {
        var xOrY = orientation == 'horizontal' ? 'x' : 'y';
        var yOrX = orientation == 'horizontal' ? 'y' : 'x';
        var widthOrHeight = orientation == 'horizontal' ? 'width' : 'height';

        // Filter lines by checking if they are either horizontal or vertical:
        var filteredLines = _.filter(lines, (line) => line[xOrY + '1'] != line[xOrY + '2']);
        // Sort as one single linear line:
        var sortedFilteredLines = _.sortBy(filteredLines, xOrY + '1');

        // group lines on the same axis:
        var groupedLines = _.groupBy(sortedFilteredLines, yOrX + '1');
        return groupedLines;
    }

    renderGroup (group) {
        // Receive first and last lines in row:
        var first = _.first(group);
        var last = _.last(group);
        var orientation = first.y1 == first.y2 ? 'horizontal' : 'vertical';
        var xOrY = orientation == 'horizontal' ? 'x' : 'y';
        var yOrX = orientation == 'horizontal' ? 'y' : 'x';

        // Create rectangle:
        group[xOrY + 1] = first[xOrY + 1];
        group[xOrY + 2] = last[xOrY + 2];
        group[yOrX + 1] = first[yOrX + 1] - 10;
        group[yOrX + 2] = first[yOrX + 2] + 10;
        group.width = Math.abs(group.x2 - group.x1);
        group.height = Math.abs(group.y2 - group.y1);

        // @TODO render this somewhere else:
        if (!group.rect) {
          console.log('creation')
          group.rect = this.svg.rect(group.x1, group.y1, group.width, group.height);
          group.rect.attr('class', 'dragger dragger-'+ orientation);
          group.rect.mousedown((e) => {
              this.preventDefault;

              var move = 20;
              // @TODO make this draggable
              if(e.buttons == 4) {
                // scrollbutton
                move = -move;
              }

              _.each(group, (line) => {
                  var linePoint = line[yOrX + '1'];
                  var position = {};
                  var widthOrHeight = orientation == 'horizontal' ? 'height' : 'width';

                  // If drawedElement is relatively left from line:
                  if (line.object[yOrX] < linePoint) {
                    // Change size of this specific drawedElement:
                    position[widthOrHeight] = line.object[widthOrHeight] + move;
                    line.object.updatePosition(position);
                  } else {
                    // Change size of this specific drawedElement AND move position:
                    position[widthOrHeight] = line.object[widthOrHeight] - move;
                    position[yOrX] = line.object[yOrX] + move;
                    line.object.updatePosition(position);
                  }
              });
          });
        }
        else {
          group.rect
          .attr('x', group.x1)
          .attr('y', group.y1)
          .attr('width', group.width)
          .attr('height', group.height)
        }

    }

    renderGroupingRects () {
      // For each group of lines:
      _.each(this.groupingRects.horizontalGroups, (group)  => {
        this.renderGroup(group);
      });
      _.each(this.groupingRects.verticalGroups, (group) => {
        this.renderGroup(group);
      });
    }

    createGroupingRects () {
        var lines = this.createGroupingLines();
        this.groupingRects.horizontalGroups = this.createGroups(lines, 'horizontal');
        this.groupingRects.verticalGroups = this.createGroups(lines, 'vertical');

        $('.dragger').remove();

        this.renderGroupingRects();
    }

    linesIntersect (line1, line2) {

    }

}

export default KozijnIsolatieWidget;

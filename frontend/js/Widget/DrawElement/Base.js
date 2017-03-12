class DrawElementBase {

    x = 0;
    y = 0;
    x2 = 0;
    y2 = 0;
    width = 0;
    height = 0;
    settings = {};
    index = 0;

    constructor (settings) {
        Object.assign(this.settings, settings);
        this.index = this.settings.widget.drawElements.length;
    }

    getType () {
        return this.type;
    }

    getDragIcon () {
        return '<div class="drag-icon">' + this.getType() + '</div>';
    }

    setPositionAndSizeByDropEvent (dropEvent) {
        var x = dropEvent.clientX;
        var y = dropEvent.clientY;

        var freeSpace = this.settings.widget.getFreeSpaceAroundXandY(x, y);
        this.setPositionAndSize(freeSpace);
    }

    setPositionAndSize (positionAndSize) {
        Object.assign(this, positionAndSize);
    }

    updateRectangle () {
        this.rectangle.attr('x', this.x);
        this.rectangle.attr('y', this.y);
        this.rectangle.attr('width', this.width);
        this.rectangle.attr('height', this.height);
    }

    updatePosition (position) {
        Object.assign(this, position);
        this.updateRectangle();
        this.settings.widget.createGroupingRects();
    }

    divideByDropEvent (elementToMakeSpaceFor, dropEvent) {
        var x, y, width, height;

        if (this.width > this.height) {
            x = dropEvent.clientX > this.width / 2 ? this.x + (this.width / 2) : this.x;
            y = this.y;
            width = this.width / 2;
            height = this.height;
            this.x = dropEvent.clientX > this.width / 2 ? this.x : this.x + (this.width / 2);
            this.width = this.width / 2;
        }
        else {
            x = this.x;
            y = dropEvent.clientY > this.height / 2 ? this.y + (this.height / 2) : this.y;
            width = this.width;
            height = this.height / 2;
            this.y = dropEvent.clientY > this.height / 2 ? this.y : this.y + (this.height / 2);
            this.height = this.height / 2;
        }

        this.updateRectangle();

        return {
            x: x,
            y: y,
            width: width,
            height: height
        }
    }

    render () {
        if (!this.rectangle) {
            this.rectangle = this.settings.widget.svg.rect(this.x, this.y, this.width, this.height);
        }
        this.rectangle.attr('class', this.getType() + ' item-' + this.index);
        this.rectangle.node.drawElement = this;
    }
}

export default DrawElementBase;

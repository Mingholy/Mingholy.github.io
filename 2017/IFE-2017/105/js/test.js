/**
 * Created by Mingholy on 2017/3/9.
 */
function quickSort(array) {
    function sort(start, end){
        var key = array[start],
            i = start,
            j = end - 1;
        if (end > (start + 1)) {
            while (i < j) {
                for (; i < j; j--) {
                    if (array[j] < key) {
                        array[i++] = array[j];
                        break;
                    }
                }
                for (; i < j; i++) {
                    if (array[i] > key) {
                        array[j--] = array[i];
                        break;
                    }
                }
            }
            array[i] = key;
            sort(0, i);
            sort(i + 1, end);
        }
    }
    sort(0, array.length);
    return array;
}
var a = [5,4,6,3,7,2,9,4,1];
console.log(quickSort(a));

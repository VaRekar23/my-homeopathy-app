import dayjs from "dayjs";

export const getAge = (dob) => {
    const today = dayjs();
    return today.diff(dob, 'year')!==0 ? 
            today.diff(dob, 'year')+' years' : 
                (today.diff(dob, 'month')!==0 ? 
                    today.diff(dob, 'month')+' months' : 
                    today.diff(dob, 'day')+' days');
}

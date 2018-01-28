import React, {Component} from 'react'
import { compose, mapProps, withState } from 'recompose'
import * as R from 'ramda';
import Either from 'data.either'

const { Right, Left } = Either

const makePredicate = ([predFn, e]) => a => {
    console.log(predFn.toString())
    return predFn(a) ? Right(a) : Left(e)
}
const makePredicates = R.map(makePredicate)
const runPredicates = ([input, validations]) =>
    R.map(predFn => predFn(input), makePredicates(validations))

const validate = R.map(R.compose(R.sequence(Either.of), runPredicates))
const makeValidationObject = R.mergeWithKey((k, l, r) => [l, r])
const getErrors = R.compose(validate, makeValidationObject)

const hello = makePredicate([(a) => a === 5,"anto"])


console.log( hello(51) );